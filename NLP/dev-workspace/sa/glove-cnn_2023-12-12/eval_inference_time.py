# Evaluation on inference time (on vanila model and ONNX model) on CPU
# 
# for more description, visit the script under tfidf-rf folder


import pandas as pd
import numpy as np

import sys
from pathlib import Path
from datetime import datetime
import time

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

# define your own cleaning function

def cleaning_arr(str_arr):
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.clean(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.deEmojify(x))
    str_arr = str_arr.apply(lambda x: x.lower())
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_num(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_symbols(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_punctuation(x))
    # str_arr = str_arr.apply(lambda x: str_cleaning_functions.remove_stopword(x))      # no need to remove stopwords, as previous study shown including stopwords can improve performance (https://aclanthology.org/P12-1092.pdf)
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.unify_whitespaces(x))
    # str_arr = str_arr.apply(lambda x: str_cleaning_functions.stemming(x))


    return str_arr


X_warmup = cleaning_arr(X_warmup)
X_eval = cleaning_arr(X_eval)


# load the models

import pickle

import tensorflow as tf
import keras

DATASET_SIZE = 240
DATASET_IS_BALANCED = True


MAX_FEATURES = 20000        # max_features params for CountVectorizer

training_name = 'glove-cnn-{}_{}k_{}'.format(
    MAX_FEATURES,
    DATASET_SIZE,
    'bal' if DATASET_IS_BALANCED else 'imbal'
)

training_args_datetime = datetime(year=2023, month=12, day=20)
training_storing_folder = Path(training_name).resolve()

# load the tf model
# either a end-to-end
# or build our own (by loading the vectorizer and the model)

with tf.device('/cpu:0'):

    text_vectorizer_path = Path.joinpath(training_storing_folder, "{}_{}_textvectorizer.pkl".format(
        training_name,
        training_args_datetime.strftime("%Y-%m-%d")
    ))
    vectorizer_from_disk = pickle.load(open(text_vectorizer_path, 'rb'))
    vectorizer = tf.keras.layers.TextVectorization(
        max_tokens=MAX_FEATURES,
        output_sequence_length=512)

    vectorizer.set_weights(vectorizer_from_disk['weights'])

    model_path = Path.joinpath(training_storing_folder, "{}_{}_model.keras".format(
        training_name,
        training_args_datetime.strftime("%Y-%m-%d")
    ))
    model = keras.models.load_model(model_path)

    end_to_end_model_path = Path.joinpath(training_storing_folder, "{}_{}_end2end.keras".format(
        training_name,
        training_args_datetime.strftime("%Y-%m-%d")
    ))

    end_to_end_model = keras.models.load_model(end_to_end_model_path)

    print('Loaded text vectorizer from {}'.format(text_vectorizer_path))
    print('Loaded model from {}'.format(model_path))
    print('Loaded end to end model from {}'.format(end_to_end_model_path))
    print('\n\n')

# load ONNX models

import onnxruntime as rt

onnx_model_path = Path.joinpath(training_storing_folder, "{}_{}_modelonly.onnx".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))

sess = rt.InferenceSession(
    onnx_model_path,
    providers=['CPUExecutionProvider']
)

input_name = [inp.name for inp in sess.get_inputs()][0]     # only one input in this model
label_names = [label.name for label in sess.get_outputs()]  # it outputs the label and the probability

print('ONNX model loaded from {}'.format(onnx_model_path))
print('\n\n')


# inference (warmup)

# force inferencing on CPU for keras
with tf.device('/cpu:0'):

    for i in range(len(df_warmup)):
        start_time_keras = time.perf_counter()
        prediction = end_to_end_model.predict([X_warmup.iloc[i]])
        end_time_keras = time.perf_counter()

        start_time_onnx_keras_vect = time.perf_counter()
        v_out = vectorizer(X_warmup.iloc[i])
        # print(v_out)
        end_time_onnx_keras_vect = time.perf_counter()
        start_time_onnx_inf = time.perf_counter()
        # print(v_out.cpu().numpy().astype(np.int32))
        prediction_onnx = sess.run(None, {input_name: [v_out.cpu().numpy().astype(np.int32)]})
        end_time_onnx_inf = time.perf_counter()

        # print(i)
        # break

    print('warmup done')
    print('\n\n')



# inference (evaluation)

keras_inf_times = []
onnx_keras_vect_times = []
onnx_inf_times = []

with tf.device('/cpu:0'):
    for i in range(len(df_eval)):
        start_time_keras = time.perf_counter()
        prediction = end_to_end_model.predict([X_eval.iloc[i]])
        end_time_keras = time.perf_counter()

        start_time_onnx_keras_vect = time.perf_counter()
        v_out = vectorizer(X_eval.iloc[i])
        end_time_onnx_keras_vect = time.perf_counter()
        start_time_onnx_inf = time.perf_counter()
        prediction_onnx = sess.run(label_names, {input_name: [v_out.cpu().numpy().astype(np.int32)]})
        end_time_onnx_inf = time.perf_counter()

        keras_inf_times.append(end_time_keras - start_time_keras)
        onnx_keras_vect_times.append(end_time_onnx_keras_vect - start_time_onnx_keras_vect)
        onnx_inf_times.append(end_time_onnx_inf - start_time_onnx_inf)

    print('evaluation done')
    print('Average onnx keras vectorization time: {:.10f}, sd: {:.10f}'.format(np.mean(onnx_keras_vect_times), np.std(onnx_keras_vect_times)))
    print('Average onnx inference time: {:.10f}, sd: {:.10f}'.format(np.mean(onnx_inf_times), np.std(onnx_inf_times)))
    print('\n\n')

    overall_onnx_times = np.array(onnx_keras_vect_times) + np.array(onnx_inf_times)

    print('Average keras inference time: {:.10f}, sd: {:.10f}'.format(np.mean(keras_inf_times), np.std(keras_inf_times)))
    print('Average overall ONNX time: {:.10f}, sd: {:.10f}'.format(np.mean(overall_onnx_times), np.std(overall_onnx_times)))
    print('average speedup: {:.4f}'.format(np.mean(keras_inf_times) / np.mean(overall_onnx_times)))
    print('\n\n')

# save all the times as np array for later analysis

# IMPORTANT !!
# rename the folder for different devices
inference_times_output_folder = 'inference_times_' + INFERENCE_MACHINE_NAME

if not Path.joinpath(training_storing_folder, inference_times_output_folder).exists():
    Path.joinpath(training_storing_folder, inference_times_output_folder).mkdir(parents=True)

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_{}_keras_inf_times.npy'.format(training_name, training_args_datetime.strftime("%Y-%m-%d"))),
    np.array(keras_inf_times))

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_{}_onnx_keras_vect_times.npy'.format(training_name, training_args_datetime.strftime("%Y-%m-%d"))),
    np.array(onnx_keras_vect_times))

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_{}_onnx_inf_times.npy'.format(training_name, training_args_datetime.strftime("%Y-%m-%d"))),
    np.array(onnx_inf_times))

print('inference times saved to {}'.format(Path.joinpath(training_storing_folder, inference_times_output_folder).resolve()))
