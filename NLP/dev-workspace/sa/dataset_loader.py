import pandas as pd
import numpy as np

from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split

# constants for training

DATASET_LIST = [120, 240, 480]
# DATASET_LIST_INDEX = 0
# DATASET_IS_BALANCED = True

TEST_RATIO = 0.1


def load_validation_dataset():
    '''Load validation dataset only
    
    Returns:
        X_imbal_valid (pd.Series): validation dataset (imbalanced)
        y_imbal_valid (pd.Series): validation dataset (imbalanced)
        X_bal_valid (pd.Series): validation dataset (balanced)
        y_bal_valid (pd.Series): validation dataset (balanced)'''

    # dataset_valid_folder_path = Path('../../dataset/sa/sampled_valid_2023-12-16/').resolve()
    dataset_valid_folder_path = Path('../../dataset/sa/sampled_valid_2024-01-16/').resolve()

    dataset_val_bal = pd.read_pickle(dataset_valid_folder_path / 'validation_balanced.pkl')
    dataset_val_imbal = pd.read_pickle(dataset_valid_folder_path / 'validation_imbalanced.pkl')

    X_imbal_valid = dataset_val_imbal['review_text']
    y_imbal_valid = dataset_val_imbal['review_score']

    X_bal_valid = dataset_val_bal['review_text']
    y_bal_valid = dataset_val_bal['review_score']

    print('Loaded validation dataset')
    print()
    print('Validation dataset imbalanced class distribution')
    print(y_imbal_valid.value_counts())
    print('Validation dataset balanced class distribution')
    print(y_bal_valid.value_counts())
    print('\n\n')

    return X_imbal_valid, y_imbal_valid, X_bal_valid, y_bal_valid

def load_presampled_traintest_dataset(dataset_size:int, is_balanced:bool):
    '''Load pre-sampled training and testing dataset from NLP/dev-workspace/dataset/sa/sampled_{dataset_size}k_2023-12-16/
    
    Args:
        dataset_size (int): size of the dataset to be loaded
        is_balanced (bool): whether to load balanced or imbalanced dataset
        
    Returns:
        X_train (pd.Series): training dataset (X)
        X_test (pd.Series): testing dataset (X)
        y_train (pd.Series): training dataset (y)
        y_test (pd.Series): testing dataset (y)'''

    if dataset_size not in DATASET_LIST:
        raise ValueError(f'Dataset size must be one of {DATASET_LIST}')

    # dataset_folder_path = Path(f'../../dataset/sa/sampled_{dataset_size}k_2023-12-16/').resolve()
    dataset_folder_path = Path(f'../../dataset/sa/sampled_{dataset_size}k_2024-01-16/').resolve()

    if is_balanced:
        dataset_traintest = pd.read_pickle(dataset_folder_path / f'dataset_bal_sampled_{dataset_size}k.pkl')
    else:
        dataset_traintest = pd.read_pickle(dataset_folder_path / f'dataset_imbal_sampled_{dataset_size}k.pkl')

    X_train_test = dataset_traintest['review_text']
    y_train_test = dataset_traintest['review_score']

    X_train, X_test, y_train, y_test = train_test_split(
        X_train_test,
        y_train_test,
        random_state=13,
        test_size=TEST_RATIO)

    print(f'Loaded dataset size: {dataset_size}k, is_balanced: {is_balanced}')
    print()
    print('Training dataset class distribution')
    print(y_train.value_counts())
    print('Testing dataset class distribution')
    print(y_test.value_counts())
    print('\n\n')
    
    return X_train, X_test, y_train, y_test