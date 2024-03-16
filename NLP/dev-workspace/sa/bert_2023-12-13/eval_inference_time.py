# Evaluation on inference time (on vanila model and ONNX model) on CPU
# 
# for more description, visit the script under tfidf-rf folder


import pandas as pd
import numpy as np

import sys
from pathlib import Path
from datetime import datetime
import time

# rename this to the name of the machine you are running on
try:
    INFERENCE_MACHINE_NAME = sys.argv[1]
except:
    raise Exception('Please provide the name of the machine you are running on as the first argument.\nFor example, if you are running on a apple m1max machine, then run: python eval_inference_time.py appl_m1max\nIf you are running on a windows machine, then run: python eval_inference_time.py [win_CPU-name]')


# load the eval dataset

eval_dataset_folder_path = Path('../../dataset/sa/eval_inference/')
df = pd.read_pickle(eval_dataset_folder_path / 'dataset_heartless_20240116_3k_eval.pkl')


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

# data cleaning function
def cleaning_arr(str_arr):
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.clean(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.deEmojify(x))

    return str_arr


X_warmup = cleaning_arr(X_warmup)
X_eval = cleaning_arr(X_eval)


# load the models

from transformers import AutoTokenizer, AutoModelForSequenceClassification
from accelerate import Accelerator


DATASET_SIZE = 480
DATASET_IS_BALANCED = True

training_args_datetime = datetime(year=2024, month=1, day=18)          # change the date to the date of training
training_name = 'bert-finetune_{}k_{}_{}'.format(
    DATASET_SIZE,
    'bal' if DATASET_IS_BALANCED else 'imbal',
    training_args_datetime.strftime('%Y-%m-%d')
)

training_storing_folder = Path(training_name).resolve()

model_path = Path.joinpath(
        training_storing_folder, 
        '{}_model'.format(
            training_name, 
            training_args_datetime.strftime('%Y-%m-%d')
        ))

# find from online
# tokenizer = AutoTokenizer.from_pretrained('bert-base-cased', device_map='cpu')                         # load in cpu
# find from local folder
tokenizer = AutoTokenizer.from_pretrained('tokenizer_bert-base-cased', device_map='cpu')                         # load in gpu
hg_model = AutoModelForSequenceClassification.from_pretrained(model_path, device_map='cpu')     # load in cpu

print('Huggingface model loaded from {}'.format(model_path))
print('\n\n')


# load ONNX model

import onnxruntime as rt

onnx_model_directory = Path.joinpath(
    training_storing_folder, model_path.name + '_onnx'
)

session = rt.InferenceSession(
    Path.joinpath(onnx_model_directory, 'model_optimized.onnx'),
    providers=['CPUExecutionProvider'])

input_names = [label.name for label in session.get_inputs()]
output_names = [label.name for label in session.get_outputs()]

print('ONNX model loaded from {}'.format(onnx_model_directory / 'model_optimized.onnx'))
print('\n\n')

# inference (warmup)

for i in range(len(df_warmup)):
    # huggingface inference
    start_time_hg_tokenizer = time.perf_counter()
    hg_inputs = tokenizer([X_warmup.iloc[i]], return_tensors="pt", max_length=tokenizer.model_max_length, truncation=True)
    end_time_hg_tokenizer = time.perf_counter()
    start_time_hg_inference = time.perf_counter()
    hg_outputs = hg_model(**hg_inputs)
    end_time_hg_tokenizer = time.perf_counter()

    # onnx inference
    start_time_onnx_tokenizer = time.perf_counter()
    onnx_inputs = tokenizer([X_warmup.iloc[i]], return_tensors="np", max_length=tokenizer.model_max_length, truncation=True)
    end_time_onnx_tokenizer = time.perf_counter()
    start_time_onnx_inference = time.perf_counter()
    onnx_outputs = session.run(output_names=output_names, input_feed=dict(onnx_inputs))
    end_time_onnx_inference = time.perf_counter()

print('warmup done')
print('\n\n')

# inference (evaluation)

hg_vect_times = []
hg_inf_times = []
onnx_vect_times = []
onnx_inf_times = []

for i in range(len(df_eval)):
    # huggingface inference
    start_time_hg_tokenizer = time.perf_counter()
    hg_inputs = tokenizer([X_eval.iloc[i]], return_tensors="pt", max_length=tokenizer.model_max_length, truncation=True)
    end_time_hg_tokenizer = time.perf_counter()
    start_time_hg_inference = time.perf_counter()
    hg_outputs = hg_model(**hg_inputs)
    end_time_hg_inference = time.perf_counter()

    # onnx inference
    start_time_onnx_tokenizer = time.perf_counter()
    onnx_inputs = tokenizer([X_eval.iloc[i]], return_tensors="np", max_length=tokenizer.model_max_length, truncation=True)
    end_time_onnx_tokenizer = time.perf_counter()
    start_time_onnx_inference = time.perf_counter()
    onnx_outputs = session.run(output_names=output_names, input_feed=dict(onnx_inputs))
    end_time_onnx_inference = time.perf_counter()

    hg_vect_times.append(end_time_hg_tokenizer - start_time_hg_tokenizer)
    hg_inf_times.append(end_time_hg_inference - start_time_hg_inference)
    onnx_vect_times.append(end_time_onnx_tokenizer - start_time_onnx_tokenizer)
    onnx_inf_times.append(end_time_onnx_inference - start_time_onnx_inference)

print('evaluation done')
print('Huggingface')
print('average vectorization time for huggingface: {:.10f}, sd: {:.10f}'.format(np.mean(hg_vect_times), np.std(hg_vect_times)))
print('average inference time for huggingface: {:.10f}, sd: {:.10f}'.format(np.mean(hg_inf_times), np.std(hg_inf_times)))
print('\n\n')
print('ONNX')
print('average vectorization time for onnx (using huggingface): {:.10f}, sd: {:.10f}'.format(np.mean(onnx_vect_times), np.std(onnx_vect_times)))
print('average inference time for onnx: {:.10f}, sd: {:.10f}'.format(np.mean(onnx_inf_times), np.std(onnx_inf_times)))
print('\n\n')

overall_hg_times = np.array(hg_vect_times) + np.array(hg_inf_times)
overall_onnx_times = np.array(onnx_vect_times) + np.array(onnx_inf_times)

print('overall time for huggingface: {:.10f}, sd: {:.10f}'.format(np.mean(overall_hg_times), np.std(overall_hg_times)))
print('overall time for onnx: {:.10f}, sd: {:.10f}'.format(np.mean(overall_onnx_times), np.std(overall_onnx_times)))
print('average speedup: {:.4f}'.format(np.mean(overall_hg_times) / np.mean(overall_onnx_times)))
print('\n\n')


# save all the times as np array for later analysis

# IMPORTANT !!
# rename the folder for different devices
inference_times_output_folder = 'inference_times_' + INFERENCE_MACHINE_NAME

if not Path.joinpath(training_storing_folder, inference_times_output_folder).exists():
    Path.joinpath(training_storing_folder, inference_times_output_folder).mkdir()

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_hg_vect_times.npy'.format(
            training_name, 
            # training_args_datetime.strftime("%Y-%m-%d")
        )),
    hg_vect_times)

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_hg_inf_times.npy'.format(
            training_name, 
            # training_args_datetime.strftime("%Y-%m-%d")
        )),
    hg_inf_times)

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_onnx_vect_times.npy'.format(
            training_name, 
            # training_args_datetime.strftime("%Y-%m-%d")
        )),
    onnx_vect_times)

np.save(
    Path.joinpath(
        training_storing_folder, 
        inference_times_output_folder, 
        '{}_onnx_inf_times.npy'.format(
            training_name, 
            # training_args_datetime.strftime("%Y-%m-%d")
        )),
    onnx_inf_times)

print('inference times saved to {}'.format(
    Path.joinpath(training_storing_folder, inference_times_output_folder).resolve()
))


