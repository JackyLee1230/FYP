from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np

from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset

from bert_finetune_utils import EvaluateTrainDatasetAtEndOfEpochCallback, MyTrainer, compute_metrics, CombinedTensorBoardCallback

import sys
 
# setting path
sys.path.append('../')

import str_cleaning_functions
import dataset_loader

DATASET_SIZE = 480
DATASET_IS_BALANCED = True

training_name = 'bert-finetune_{}k_{}'.format(
    DATASET_SIZE,
    'bal' if DATASET_IS_BALANCED else 'imbal')

training_storing_folder = Path(f'{training_name}/').resolve()
if not training_storing_folder.exists():
    training_storing_folder.mkdir(parents=True, exist_ok=True)

print('Training storing folder:')
print(training_storing_folder)
print('\n\n')

X_imbal_valid, y_imbal_valid, X_bal_valid, y_bal_valid = dataset_loader.load_validation_dataset()

X_train, X_test, y_train, y_test = dataset_loader.load_presampled_traintest_dataset(DATASET_SIZE, DATASET_IS_BALANCED)

# data cleaning

def cleaning_arr(str_arr):
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.clean(x))
    str_arr = str_arr.apply(lambda x: str_cleaning_functions.deEmojify(x))

    return str_arr

X_train = cleaning_arr(X_train)
X_test = cleaning_arr(X_test)

X_train = X_train.to_numpy()
X_test = X_test.to_numpy()
y_train = y_train.to_numpy()
y_test = y_test.to_numpy()

# create huggingface dataset object


# create a dataset object for handling large amount of data

ds_train = Dataset.from_dict({
    "text": [str(s) for s in list(X_train.flatten())],
    "label": list(y_train)
})

ds_test = Dataset.from_dict({
    "text": [str(s) for s in list(X_test.flatten())],
    "label": list(y_test)
})

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")

def tokenize_dataset(data):
    # Keys of the returned dictionary will be added to the dataset as columns
    return tokenizer(data["text"], padding='max_length', max_length=tokenizer.model_max_length, truncation=True)

# apply tokenizer to the dataset
ds_train = ds_train.map(tokenize_dataset, batched=True)
ds_test = ds_test.map(tokenize_dataset, batched=True)

# shuffle dataset to randomize the order of the data
# not doing it as not mentioned in papers
# ds_train = ds_train.shuffle()
# ds_train = ds_train.flatten_indices()       # rewrite the shuffled dataset on disk as continguous chunks of data

model = AutoModelForSequenceClassification.from_pretrained("bert-base-cased", num_labels=2)

training_args_datetime = datetime(year=2023, month=12, day=20)

training_name = training_name + '_' + training_args_datetime.strftime("%Y-%m-%d")

# Specify where to save the checkpoints from your training:
training_args = TrainingArguments(output_dir=Path.joinpath(training_storing_folder, training_name),
                                  per_device_train_batch_size=32,
                                  per_device_eval_batch_size=32,
                                  learning_rate=2e-5,
                                  weight_decay=0.01,
                                  optim='adamw_torch',  # state explicity
                                  adam_beta1=0.9,       # state explicitly
                                  adam_beta2=0.999,     # state explicitly
                                #   warmup_steps=10000,   # seems not required in fine-tuning, as we have less than 10k steps
                                  num_train_epochs=3,
                                  evaluation_strategy="steps",
                                  save_strategy="steps",
                                  save_steps=500,
                                  eval_steps=500,
                                  metric_for_best_model='eval_loss',
                                  load_best_model_at_end=True)


# trainer = MyTrainer(
#     model=model,
#     args=training_args,
#     # train_dataset=ds_train_small,
#     # eval_dataset=ds_test_small,
#     train_dataset=ds_train,
#     eval_dataset=ds_test,
#     compute_metrics=compute_metrics,
#     callbacks=[CombinedTensorBoardCallback]
# )


trainer = Trainer(
    model=model,
    args=training_args,
    # train_dataset=ds_train_small,
    # eval_dataset=ds_test_small,
    train_dataset=ds_train,
    eval_dataset=ds_test,
    compute_metrics=compute_metrics,
    callbacks=[CombinedTensorBoardCallback]
)
trainer.add_callback(EvaluateTrainDatasetAtEndOfEpochCallback(trainer))

print('\n\n')
print('FINETUNING BERT with {}k dataset, is_balanced: {}'.format(DATASET_SIZE, DATASET_IS_BALANCED))

# trainer.train()

trainer.train(resume_from_checkpoint=True)

print('\n')
print("FINETUNING COMPLETED")
print('\n\n')

# save model
trainer.save_model(str(Path.joinpath(training_storing_folder, training_name+'_model')))

print('MODEL SAVED')
print('\n\n')

# save pipeline
from transformers import pipeline
my_pipeline = pipeline(
    'text-classification',
    model=AutoModelForSequenceClassification.from_pretrained(
        str(Path.joinpath(training_storing_folder, training_name+'_model'))),
    tokenizer=tokenizer
)

my_pipeline.save_pretrained(str(Path.joinpath(training_storing_folder, training_name+'_pipeline')))

print('PIPELINE SAVED')
print('\n\n')


# Evaluate model

# print("Evaluating on test set")
# print(trainer.predict(
#     ds_test
# ))
# print()

# X_imbal_valid = cleaning_arr(X_imbal_valid)
# X_bal_valid = cleaning_arr(X_bal_valid)

# X_imbal_valid = X_imbal_valid.to_numpy()
# y_imbal_valid = y_imbal_valid.to_numpy()
# X_bal_valid = X_bal_valid.to_numpy()
# y_bal_valid = y_bal_valid.to_numpy()

# ds_imbal_valid = Dataset.from_dict({
#     "text": [str(s) for s in list(X_imbal_valid.flatten())],
#     "label": list(y_imbal_valid)
# })

# ds_bal_valid = Dataset.from_dict({
#     "text": [str(s) for s in list(X_bal_valid.flatten())],
#     "label": list(y_bal_valid)
# })

# # apply tokenizer to the dataset
# ds_imbal_valid = ds_imbal_valid.map(tokenize_dataset, batched=True)
# ds_bal_valid = ds_bal_valid.map(tokenize_dataset, batched=True)

# print("Evaluating on validation set (imbalanced)")
# print(trainer.predict(
#     ds_imbal_valid
# ))
# print()

# print("Evaluating on validation set (balanced)")
# print(trainer.predict(
#     ds_bal_valid
# ))
# print()

print('SCRIPT ENDED')
