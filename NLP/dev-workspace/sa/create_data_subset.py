import pandas as pd
import numpy as np

from pathlib import Path
import random

from sklearn.model_selection import train_test_split

# constants

dataset_heartless_path = Path('../../dataset/sa/dataset_cleaned_heartless.pkl').resolve()

VALIDATION_RATIO = 0.2      # ratio of validation set to whole ~4.8M dataset
TEST_RATIO = 0.2            # ratio of test set to the whole train-test dataset

def load_cleaned_dataset() -> pd.DataFrame:
    '''Load the cleaned dataset stored in the folder dataset/sa/
    '''
    dataset = pd.read_pickle(dataset_heartless_path)
    # dataset = dataset.sample(frac=p)      # no sampling is needed

    # convert the text to string object
    dataset['review_text'] = dataset['review_text'].astype('str')

    # drop any duplicate just in case
    dataset = dataset.drop_duplicates(keep='first')

    # replace -1 to 0
    # then 0 = negative, 1 = positive
    # for easier processing
    dataset['review_score'] = dataset['review_score'].replace(-1, 0)

    # dataset.info()

    dataset['review_text'] = dataset['review_text'].astype('str')

    dataset = dataset.drop_duplicates(keep='first')

    # remove rows have all whitespaces
    dataset['num_of_words'] = dataset['review_text'].apply(lambda x:len(str(x).split()))
    dataset = dataset[dataset['num_of_words'] > 0]

    # remove number of rows that have less than N number of characters

    character_limit = 20

    dataset = dataset[dataset['review_text'].str.len()>=character_limit]

    # dataset.info()

    return dataset

def create_train_test_valid_split(dataset: pd.DataFrame):
    '''Create fixed training-testing set and validation set for different models
    
    return splited sets in string and label numpy 1D arrays

    params
    - dataset: the cleaned dataset
    '''

    X = dataset['review_text']
    y = dataset['review_score']

    X_train_test, X_valid, y_train_test, y_valid = train_test_split(X, y, random_state=42, test_size=VALIDATION_RATIO)

    print(len(X_valid))
    print(len(y_valid))
    print(len(X_train_test))
    print(len(y_train_test))

    print()
    print()

    print('validation set')
    print(y_valid.value_counts())
    print()
    print('train-test set')
    print(y_train_test.value_counts())

    X_valid = X_valid.to_numpy()
    y_valid = y_valid.to_numpy()

    return X_train_test, X_valid, y_train_test, y_valid


# TODO: add common oversampling and undersampling functions

# TODO: add common EDA (Easy Data Augmentation) functions
