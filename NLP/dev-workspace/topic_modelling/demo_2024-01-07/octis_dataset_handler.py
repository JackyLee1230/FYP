import pickle
import numpy as np
import pandas as pd

from octis.dataset.dataset import Dataset

# TODO: create an adapter to create an octis dataset from a pandas dataframe or numpy array
# should return a octis dataset object

# also create a function to SL our datasets to a file without touching octis dataset SL methods

# override octis dataset class, and some methods (particularly the SL methods)

class OctisDatasetHandler(Dataset):
    def __init__(self, corpus=None, vocabulary=None, labels=None, metadata=None, document_indexes=None):
        """
        Initialize a dataset, parameters are optional
        if you want to load a dataset, initialize this
        class with default values and use the load method
        Parameters
        ----------
        corpus : corpus of the dataset (python list of lists of strs)
        vocabulary : vocabulary of the dataset
        labels : labels of the dataset
        metadata : metadata of the dataset
        """
        super().__init__(corpus, vocabulary, labels, metadata, document_indexes)
  
    # no need to override methods related to partitioned datasets

    # we load our pre-processed dataset (list of lists of strings)
    # for direct evaluation in optimizer
    def load_custom_dataset_from_folder(self, path, multilabel=False, **kwargs):
        """
        Load our custom dataset from a folder
        Parameters
        ----------
        path : path of the folder
        multilabel : boolean, True if the dataset is multilabel
        kwargs : additional arguments
        """

        # load the dataset from the path

        with open(path, 'r') as f:
            X_lemmatized = pickle.dump(f)

        # datatype check
        if not isinstance(X_lemmatized, list):
            raise ValueError("The dataset must be a list of lists of strings")
        
        if not isinstance(X_lemmatized[0], list):
            raise ValueError("The dataset must be a list of lists of strings")

        if not isinstance(X_lemmatized[0][0], str):
            raise ValueError("The dataset must be a list of lists of strings")

        # set the corpus
        self.set_corpus(X_lemmatized)