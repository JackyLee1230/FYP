# Evaluation on inference time (on vanila model and ONNX model) on CPU
# 
# code is referenced from MMDeploy
# 
# https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/02-how-to-run/profile_model.md
# 
# https://github.com/open-mmlab/mmdeploy/blob/main/tools/test.py
# 
# https://github.com/open-mmlab/mmdeploy/blob/main/mmdeploy/utils/timer.py
# 
# https://deci.ai/blog/measure-inference-time-deep-neural-networks/


import pandas as pd
import numpy as np

import sys
from pathlib import Path
from datetime import datetime
import time

from sklearn.pipeline import Pipeline
# from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer, TfidfTransformer
# from sklearn.ensemble import RandomForestClassifier

# rename this to the name of the machine you are running on
try:
    INFERENCE_MACHINE_NAME = sys.argv[1]
except:
    raise Exception('Please provide the name of the machine you are running on as the first argument.\nFor example, if you are running on a apple m1max machine, then run: python eval_inference_time.py appl_m1max\nIf you are running on a windows machine, then run: python eval_inference_time.py [win_CPU-name]')

# load the eval dataset

eval_dataset_folder_path = Path('../../dataset/sa/eval_inference/')
df = pd.read_pickle(eval_dataset_folder_path / 'dataset_cleaned_heartless_cleaned_3k_eval.pkl')

# create dataset for warmup and evaluation

WARMUP_SIZE = 1000

df_warmup = df[:WARMUP_SIZE]
df_eval = df[WARMUP_SIZE:]

X_warmup = df_warmup['review_text']
y_warmup = df_warmup['review_score']

X_eval = df_eval['review_text']
y_eval = df_eval['review_score']



# setting path for common utils script
sys.path.append('../')

import str_cleaning_functions

# data cleaning function, same as in the training script

def cleaning_arr(str_arr):
    '''apply all cleaning functions to a numpy array, or a pandas series object'''
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.clean(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.deEmojify(x))
    str_arr = str_arr.apply(lambda x: x.lower())
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_num(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_symbols(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_punctuation(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_stopword(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.unify_whitespaces(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.stemming(x))

    return str_arr


X_warmup = cleaning_arr(X_warmup)
X_eval = cleaning_arr(X_eval)


# load the models

import pickle

DATASET_SIZE = 240          # change this to load diff model
DATASET_IS_BALANCED = True  # change this to load diff model

MAX_FEATURES = 20000        # max_features params for CountVectorizer

training_name = 'tfidf-rf-{}_{}k_{}'.format(
    MAX_FEATURES,
    DATASET_SIZE,
    'bal' if DATASET_IS_BALANCED else 'imbal'
)

training_args_datetime = datetime(year=2023, month=12, day=20)


training_storing_folder = Path(f"{training_name}/").resolve()
if not training_storing_folder.exists():
    training_storing_folder.mkdir(parents=True, exist_ok=True)


rf_model_path = Path.joinpath(training_storing_folder, "{}_{}_model.sav".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))
model = pickle.load(open(rf_model_path, 'rb'))

count_vectorizer_path = Path.joinpath(training_storing_folder, "{}_{}_count_vectorizer.pkl".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))
vectorizer = pickle.load(open(count_vectorizer_path, 'rb'))

tfidf_transformer_path = Path.joinpath(training_storing_folder, "{}_{}_tfidf.pkl".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))
tfidf = pickle.load(open(tfidf_transformer_path, 'rb'))

print('Loaded model from {}'.format(rf_model_path))
print('Loaded count vectorizer from {}'.format(count_vectorizer_path))
print('Loaded tfidf transformer from {}'.format(tfidf_transformer_path))

pipeline_inference = Pipeline([
    ('vect', vectorizer),
    ('tfidf', tfidf),
    ('model', model),
])

print('\n\n')
print('Pipeline loaded')


# load ONNX models

import onnxruntime as rt

onnx_model_path = Path.joinpath(training_storing_folder, "{}_{}_pipeline.onnx".format(
        training_name, training_args_datetime.strftime("%Y-%m-%d")))

sess = rt.InferenceSession(
    onnx_model_path,
    providers=['CPUExecutionProvider']
    )

print('\n\n')
print('ONNX model loaded from {}'.format(onnx_model_path))

input_name = [inp.name for inp in sess.get_inputs()][0]     # only one input in this model
label_names = [label.name for label in sess.get_outputs()]  # it outputs the label and the probability


# inference (warmup)

for i in range(len(df_warmup)):
    start_time_sklearn = time.perf_counter()
    prediction = pipeline_inference.predict([X_warmup.iloc[i]])
    end_time_sklearn = time.perf_counter()

    start_time_onnx = time.perf_counter()
    prediction_onnx = sess.run(label_names, {input_name: [[X_warmup.iloc[i]]]})
    end_time_onnx = time.perf_counter()

    # print('Sklearn Prediction: {}, time: {}'.format(prediction, end_time_sklearn - start_time_sklearn))
    # print('ONNX Prediction: {}, time: {}'.format(prediction, end_time_onnx - start_time_onnx))


# inference (evaluation)

sklearn_inf_times = []
onnx_inf_times = []

for i in range(len(df_eval)):
    start_time_sklearn = time.perf_counter()
    prediction = pipeline_inference.predict([X_eval.iloc[i]])
    end_time_sklearn = time.perf_counter()

    start_time_onnx = time.perf_counter()
    prediction_onnx = sess.run(label_names, {input_name: [[X_eval.iloc[i]]]})
    end_time_onnx = time.perf_counter()

    sklearn_inf_times.append(end_time_sklearn - start_time_sklearn)
    onnx_inf_times.append(end_time_onnx - start_time_onnx)

    # print('Sklearn Prediction: {}, time: {}'.format(prediction, end_time_sklearn - start_time_sklearn))
    # print('ONNX Prediction: {}, time: {}'.format(prediction, end_time_onnx - start_time_onnx))

print('\n\n')
print('evaluation done')
print('average sklearn inference time: {:.10f}, sd: {:.10f}'.format(np.mean(sklearn_inf_times), np.std(sklearn_inf_times)))
print('average onnx inference time: {:.10f}, sd: {:.10f}'.format(np.mean(onnx_inf_times), np.std(onnx_inf_times)))
print('average speedup: {:.4f}'.format(np.mean(sklearn_inf_times) / np.mean(onnx_inf_times)))



# save the list of inference times as np array for plot generation

# IMPORTANT !!
# rename the folder for different devices
inference_times_output_folder = 'inference_times_' + INFERENCE_MACHINE_NAME

if not Path.joinpath(training_storing_folder, inference_times_output_folder).exists():
    Path.joinpath(training_storing_folder, inference_times_output_folder).mkdir(parents=True)

np.save(
    Path.joinpath(training_storing_folder, inference_times_output_folder, "{}_{}_sklearn_inf_times.npy".format(
        training_name, training_args_datetime.strftime("%Y-%m-%d"))),
    np.array(sklearn_inf_times)
)

np.save(
    Path.joinpath(training_storing_folder, inference_times_output_folder, "{}_{}_onnx_inf_times.npy".format(
        training_name, training_args_datetime.strftime("%Y-%m-%d"))),
    np.array(onnx_inf_times)
)

print('\n\n')
print('inference times saved to {}'.format(Path.joinpath(training_storing_folder, inference_times_output_folder).resolve()))


