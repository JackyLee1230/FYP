import pandas as pd
import numpy as np

from pathlib import Path
from datetime import datetime
import pickle

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer, TfidfTransformer
from sklearn.ensemble import RandomForestClassifier

import sys
 
# setting path for importing scripts
sys.path.append('../')

import str_cleaning_functions
import dataset_loader

DATASET_SIZE = 480
DATASET_IS_BALANCED = False


MAX_FEATURES = 20000        # max_features params for CountVectorizer

training_name = 'tfidf-fa-{}_{}k_{}'.format(
    MAX_FEATURES,
    DATASET_SIZE,
    'bal' if DATASET_IS_BALANCED else 'imbal'
)

training_storing_folder = Path(f"{training_name}/").resolve()
if not training_storing_folder.exists():
    training_storing_folder.mkdir(parents=True, exist_ok=True)

training_args_datetime = datetime.today()

print('Training storing folder:')
print(training_storing_folder)
print('\n\n')

dataset_traintest, X_imbal_valid, y_imbal_valid, X_bal_valid, y_bal_valid = dataset_loader.load_presampled_dataset(DATASET_SIZE, DATASET_IS_BALANCED)

X_train, X_test, y_train, y_test = dataset_loader.create_traintest_dataset(dataset_traintest)

# data cleaning

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

print('CLEANING TRAINING AND TEST SET')
print('\n\n')

X_train = cleaning_arr(X_train)
X_test = cleaning_arr(X_test)

X_train = X_train.to_numpy()
X_test = X_test.to_numpy()
y_train = y_train.to_numpy()
y_test = y_test.to_numpy()

print('CLEANING COMPLETED')
print('\n\n')


# Build sklearn tfidf and random forest model

vectorizer = CountVectorizer(stop_words="english", max_features=MAX_FEATURES)
tfidf = TfidfTransformer()
model = RandomForestClassifier(verbose=3)

# create features through count vectorizer over training set
# we then use this vectorizer and apply to the test set (.transform() only)
X_train_vectorized = vectorizer.fit_transform(X_train)

# create training pipeline
pipeline = Pipeline([
    ('tfidf', tfidf),
    ('rf', model)
])

print('TRAINING TFIDF-RF MODEL with {}k dataset, is_balanced: {}'.format(DATASET_SIZE, DATASET_IS_BALANCED))
print('\n\n')

sa_classifier = pipeline.fit(X_train_vectorized, y_train)

# save model
# save the rf model, count-vectorizer, and tfidf transformer
# so that we can rebuild the pipeline for custom evaluation

rf_model_path = Path.joinpath(training_storing_folder, "{}_{}_model.sav".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))
pickle.dump(model, open(rf_model_path, 'wb'))

count_vectorizer_path = Path.joinpath(training_storing_folder, "{}_{}_count_vectorizer.pkl".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))
pickle.dump(vectorizer, open(count_vectorizer_path, 'wb'))

tfidf_transformer_path = Path.joinpath(training_storing_folder, "{}_{}_tfidf.pkl".format(
    training_name,
    training_args_datetime.strftime("%Y-%m-%d")
))
pickle.dump(tfidf, open(tfidf_transformer_path, 'wb'))

print('MODEL SAVED TO:')
print('Random Forest model')
print(rf_model_path)
print()
print('CountVectorizer')
print(count_vectorizer_path)
print()
print('TFIDF Transformer')
print(tfidf_transformer_path)
print()
print('\n\n')

print('TRAINING COMPLETED')