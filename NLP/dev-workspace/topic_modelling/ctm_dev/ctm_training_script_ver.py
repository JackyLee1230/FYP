
# CTM Training (hyperparameters grid/random search)
# 
# Combined TM

import warnings
warnings.filterwarnings("ignore", category=UserWarning)     # disable sklearn CountVectorizer warning

import pandas as pd
import numpy as np


from contextualized_topic_models.models.ctm import CombinedTM
from contextualized_topic_models.utils.data_preparation import TopicModelDataPreparation
# from contextualized_topic_models.utils.preprocessing import WhiteSpacePreprocessingStopwords

import nltk
import os

from pathlib import Path
import json
from datetime import datetime

import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"          # disable huggingface warning

import sys

sys.path.append('../')


# load the dataset

from dataset_loader import GENRES, load_dataset

genre = GENRES.INDIE
unique_list = ['review_text']
# dataset_folder = Path(f'../../dataset/topic_modelling/top_11_genres_unique_[{",".join(unique_list)}]')
# dataset, dataset_path = load_dataset(genre, dataset_folder)

genre = -1
unique_list = ['review_text']
dataset_folder = Path(f'../../dataset/topic_modelling/00_dataset_filtered_all_4045065.pkl').resolve()
dataset, dataset_path = pd.read_pickle(dataset_folder), dataset_folder
dataset_folder = dataset_path.parent

dataset.info(verbose=True)


# # The path of the dataset to be stored to the config file
# str(dataset_path.relative_to(dataset_path.parent.parent.parent.parent))


# # data preprocessing

# import sys
# sys.path.append('../../sa/')

# import str_cleaning_functions

# # copied from lda_demo_gridsearch.ipynb
# def cleaning(df, review):
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.remove_links(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.remove_links2(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.clean(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.deEmojify(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.remove_non_letters(x))
#     df[review] = df[review].apply(lambda x: x.lower())
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.unify_whitespaces(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.remove_stopword(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.unify_whitespaces(x))

# # def cleaning_strlist(str_list):
# #     str_list = list(map(lambda x: clean(x), str_list))
# #     str_list = list(map(lambda x: deEmojify(x), str_list))

# #     str_list = list(map(lambda x: x.lower(), str_list))
# #     str_list = list(map(lambda x: remove_num(x), str_list))
# #     str_list = list(map(lambda x: unify_whitespaces(x), str_list))

# #     str_list = list(map(lambda x: _deaccent(x), str_list))
# #     str_list = list(map(lambda x: remove_non_alphabets(x), str_list))
# #     str_list = list(map(lambda x: remove_stopword(x), str_list))
# #     return str_list

# # copied from bert_demo_gridsearch.ipynb
# def cleaning_little(df, review):
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.remove_links(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.remove_links2(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.clean(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.deEmojify(x))
#     df[review] = df[review].apply(lambda x: str_cleaning_functions.unify_whitespaces(x))



# # create a copy of the dataset, as we need both untouched text and cleaned text
# # create a column copy
# dataset['review_text_bow'] = dataset['review_text'].copy()


# cleaning(dataset, 'review_text_bow')
# cleaning_little(dataset, 'review_text')


# dataset


# # remove reviews with too many punctuations

# def calculate_nonalphabet_ratio(review: str) -> float:
#     count = 0
#     for char in review:
#         if not char.isalpha():
#             count += 1
#     return count / (len(review) + 1e-5)

# dataset['alphabet_ratio'] = dataset['review_text'].apply(calculate_nonalphabet_ratio)

# dataset['alphabet_ratio'].describe([0.25, 0.5, 0.75, 0.9, 0.95, 0.99])


# # remove reviews with too many punctuations
# # ratio threashold = 99 percentile
# dataset = dataset[dataset['alphabet_ratio'] < dataset.alphabet_ratio.quantile(0.99)]

# # dataset_tobe_removed = dataset[dataset['alphabet_ratio'] >= dataset.alphabet_ratio.quantile(0.99)]

# # remove reviews with too many punctuations by index
# # dataset = dataset.drop(dataset_tobe_removed.index)
# # dataset_preprocessed = dataset_preprocessed.drop(dataset_tobe_removed.index)


# # remove docs with 0 len

# def _filter_zero_len(x):
#     if len(x['review_text']) == 0 or len(x['review_text_bow']) == 0:
#         return False
#     return True

# dataset = dataset[dataset.apply(lambda x: _filter_zero_len(x), axis=1)]


# print(len(dataset))


# import torch
# import platform


# if platform.system() == 'Linux' or platform.system() == 'Windows':
#     device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# else:
#     device = torch.device('mps')        # m-series mac machine

# print(device)


# # Apply lemmatizing to the preprocessed dataset as well (for BoW)
# # 
# # The function is identical in LDA


# # do lemmatization, but not stemming (as part of speech is important in topic modelling)
# # use nltk wordnet for lemmatization

# from nltk.stem import WordNetLemmatizer
# from nltk.corpus import wordnet

# lemma = WordNetLemmatizer()

# # from https://stackoverflow.com/questions/25534214/nltk-wordnet-lemmatizer-shouldnt-it-lemmatize-all-inflections-of-a-word

# # from: https://www.cnblogs.com/jclian91/p/9898511.html
# def get_wordnet_pos(tag):
#     if tag.startswith('J'):
#         return wordnet.ADJ
#     elif tag.startswith('V'):
#         return wordnet.VERB
#     elif tag.startswith('N'):
#         return wordnet.NOUN
#     elif tag.startswith('R'):
#         return wordnet.ADV
#     else:
#         return None     # if none -> created as noun by wordnet
    
# def lemmatization(text):
#    # use nltk to get PoS tag
#     tagged = nltk.pos_tag(nltk.word_tokenize(text))

#     # then we only need adj, adv, verb, noun
#     # convert from nltk Penn Treebank tag to wordnet tag
#     wn_tagged = list(map(lambda x: (x[0], get_wordnet_pos(x[1])), tagged))

#     # lemmatize by the PoS
#     lemmatized = list(map(lambda x: lemma.lemmatize(x[0], pos=x[1] if x[1] else wordnet.NOUN), wn_tagged))
#     # lemma.lemmatize(wn_tagged[0], pos=wordnet.NOUN)

#     return lemmatized




# from datasets import Dataset

# # X_preprocessed2 = list(map(lambda x: lemmatization(x), X_preprocessed))
# # X_preprocessed2 = list(map(lambda x: ' '.join(x), X_preprocessed2))

# def lemmatization_dataset(data):
#     return {'review_text2': ' '.join(lemmatization(data['review_text']))}

# temp_dataset = Dataset.from_dict({'review_text': dataset['review_text_bow'].values})
# temp_dataset = temp_dataset.map(lemmatization_dataset, num_proc=4)      # speed up lemmatization
# dataset['review_text_bow'] = temp_dataset['review_text2']


# save the dataset obj to disk
if genre >= 0:
    dataset_preprocessed_path = Path(f'preprocessed_data/{genre.value:02}_{str(genre)}_dataset.pkl')
else:
    dataset_preprocessed_path = Path(f'preprocessed_data/all_genres_dataset.pkl')

if not dataset_preprocessed_path.parent.exists():
    dataset_preprocessed_path.parent.mkdir()

if not dataset_preprocessed_path.exists():
    dataset.to_pickle(dataset_preprocessed_path)
else:
    print(f'{dataset_preprocessed_path} already exists. Read the existing file.')
    with open(dataset_preprocessed_path, 'rb') as f:
        dataset = pd.read_pickle(f)
    
    print(dataset.info(verbose=True))


# Training


# copy from: https://github.com/MilaNLProc/contextualized-topic-models/blob/master/contextualized_topic_models/utils/data_preparation.py#L44
# call bert_embeddings_from_list() to produce embeddings by ourself

import torch
import platform


if platform.system() == 'Linux' or platform.system() == 'Windows':
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
else:
    device = torch.device('mps')        # m-series mac machine

print(device)


# moved the functions ctm_dataset_creation.py
from ctm_dataset_creation import bert_embeddings_from_list


# Before training, assuming the sbert model is not a hyperparameter
# 
# We need to handle the token length limit like bertopic did
# 
# To do that, we transform the X as the token, and split X by the token length
# 
# Then for each splitted sentence, we keep the BoW for convenience (otherwise the whole script has to be re-worked)


# from datasets import Dataset
from tqdm.autonotebook import trange

def split_X_contextual_X_bow(X_contextual, X_bow, X, sbert, split:bool=False):
    if not split:
        return X_contextual, X_bow, X
    else:
        X_contextual_new, X_bow_new, X_new = [], [], []
        tokenizer = sbert[0].tokenizer

        batch_size = 64
        for start_index in trange(0, len(X_contextual), batch_size, desc="Batches", disable=False):
            sentence_batch = X_contextual[start_index:start_index+batch_size]
            features = tokenizer(sentence_batch, return_attention_mask=True, return_token_type_ids=True, add_special_tokens=False, return_tensors=None, truncation=False)

            # split overlapping
            features_split = split_tokens_into_smaller_chunks(features, sbert.max_seq_length-2,  sbert.max_seq_length-2, 1)

            for i, input_id_list in enumerate(features_split['input_ids']):
                for input_id in input_id_list:
                    X_contextual_new.append(tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(input_id)))
                    X_bow_new.append(X_bow[start_index+i])
                    X_new.append(X[start_index+i])


        assert len(X_contextual_new) == len(X_bow_new), "X_contextual_new and X_bow_new should have the same length. Found: {} and {}".format(len(X_contextual_new), len(X_bow_new))
        assert len(X_contextual_new) == len(X_new), "X_contextual_new and X_new should have the same length. Found: {} and {}".format(len(X_contextual_new), len(X_new))
        return X_contextual_new, X_bow_new, X_new


# def create_split_X_contextual(X_contextual, sbert):

#     X_contextual_new = []   

#     tokenizer = sbert[0].tokenizer

#     # tokenize the dataset
#     # then split the tokens into smaller chunks
#     ds_sentences = Dataset.from_dict({'text': X_contextual})
#     ds_sentences = ds_sentences.map(tokenize_dataset, batched=True, fn_kwargs={'tokenizer':tokenizer})
#     ds_sentences2 = Dataset.from_dict({'input_ids': ds_sentences['input_ids'], 'token_type_ids': ds_sentences['token_type_ids'], 'attention_mask': ds_sentences['attention_mask']})
#     ds_sentences2 = ds_sentences2.map(split_tokens_into_smaller_chunks, batched=True, fn_kwargs={'chunk_size': sbert.max_seq_length-2, 'stride': sbert.max_seq_length-2, 'minimal_chunk_length': 1})

#     # re-create new sentences based on tokens
#     for input_id in ds_sentences2['input_ids']:
#         X_contextual_new.append(tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(input_id)))
    
#     # create new embeddings based on the new sentences -> identical, yet splitted tokens
#     # use the sbert encode function instead of hugging-face
#     # as it has better memory management for large dataset
#     # embeddings = sbert.encode(X_new, show_progress_bar=True, batch_size=64)

#     # _print_message('Embeddings created with splitting')
#     return X_contextual_new
    
# ####################
# # helper functions
# ####################
    
# tokens spliting helper functions

def split_tokens_into_smaller_chunks(
    data,
    chunk_size: int,
    stride: int,
    minimal_chunk_length: int,
) -> dict:
    """Splits tokens into overlapping chunks with given size and stride."""

    _new_input_id_chunks = []
    _new_token_type_ids = []
    _new_mask_chunks = []

    for input_id, token_type_id, mask_chunk in zip(data['input_ids'], data['token_type_ids'], data['attention_mask']):
        _input_id_chunk = split_overlapping(input_id, chunk_size, stride, minimal_chunk_length)
        _token_type_id = split_overlapping(token_type_id, chunk_size, stride, minimal_chunk_length)
        _mask_chunk = split_overlapping(mask_chunk, chunk_size, stride, minimal_chunk_length)

        _new_input_id_chunks.append(_input_id_chunk)
        _new_token_type_ids.append(_token_type_id)
        _new_mask_chunks.append(_mask_chunk)    

    return {'input_ids':_new_input_id_chunks, 'token_type_ids':_new_token_type_ids, 'attention_mask': _new_mask_chunks}

def split_overlapping(tensor:list[int], chunk_size: int, stride: int, minimal_chunk_length: int) -> list[list[int]]:
    """Helper function for dividing 1-dimensional tensors into overlapping chunks."""
    # check_split_parameters_consistency(chunk_size, stride, minimal_chunk_length)
    result = [tensor[i : i + chunk_size] for i in range(0, len(tensor), stride)]
    if len(result) > 1:
        # ignore chunks with less than minimal_length number of tokens
        result = [x for x in result if len(x) >= minimal_chunk_length]
    return result


def tokenize_dataset(data, tokenizer):
    # return sbert_model[0].tokenizer(data['text'], return_attention_mask=True, return_token_type_ids=True, add_special_tokens=False, return_tensors=None, truncation=False)
    return {'tokenized': tokenizer(data['text'], return_attention_mask=True, return_token_type_ids=True, add_special_tokens=False, return_tensors=None, truncation=False)}



# ATTENTION !!!!!
# define the sbert model (SHOULD BE THE SAME AS TRAINING)
# also define whether we want to split the tokens or not

split_sentences = True
sbert_model_name = 'all-MiniLM-L6-v2'

# load the sbert model
from sentence_transformers import SentenceTransformer
sbert = SentenceTransformer(sbert_model_name, device=device)



X = dataset['review_text'].values
X = list(X)
X_preprocessed = dataset['review_text_bow'].values

X_contextual, X_bow, X = split_X_contextual_X_bow(
    X, X_preprocessed, X, 
    sbert, 
    split=split_sentences)


print(len(X))


# Then the real training begins


from gensim.models import CoherenceModel
from copy import deepcopy

from sklearn.model_selection import ParameterGrid, ParameterSampler

sys.path.append('../')

from eval_metrics import compute_inverted_rbo, compute_topic_diversity, compute_pairwise_jaccard_similarity, \
                        METRICS, SEARCH_BEHAVIOUR, COHERENCE_MODEL_METRICS


def _print_message(message):
    '''Print message with a timestamp in front of it

    Timestamp format: YYYY-MM-DD HH:MM:SS,mmm
    '''
    print(f'{datetime.now().strftime("%Y-%m-%d %H:%M:%S,%f")[:-3]} - {message}')


# init params

def _init_count_vectorizer_params(
        max_features=2000,
        ngram_range=(1,1)
):
    params_dict = {}
    params_dict['max_features'] = max_features
    params_dict['ngram_range'] = ngram_range

    return params_dict

def _init_sbert_params(
    model_name_or_path='all-mpnet-base-v2'
):
    params_dict = {}
    params_dict['model_name_or_path'] = model_name_or_path

    return params_dict

# params are copied from source code of CTM: https://github.com/MilaNLProc/contextualized-topic-models/blob/master/contextualized_topic_models/models/ctm.py#L131
# commented params are params that has no plan on fine-tuning them (not significant to our project)
def _init_ctm_params(
        # bow_size,
        # contextual_size,
        # inference_type="combined",
        n_components=10,
        # model_type="prodLDA",
        hidden_sizes=[100, 100],        # pass as list as json does not support tuple
        # activation="softplus",
        dropout=0.2,
        # learn_priors=True,
        # batch_size=64,
        lr=2e-3,
        momentum=0.99,
        solver="adam",
        num_epochs=100,
        # reduce_on_plateau=False,      # only valid if there's a testing data (seems no need to havbe label, just partition a testing dataset with train_test_split()))
        # num_data_loader_workers=mp.cpu_count(),
        # label_size=0,
        # loss_weights=None
):
    params_dict = {}
    # params_dict['bow_size'] = bow_size                        # decided by the count vectorizer params (max_features)
    # params_dict['contextual_size'] = contextual_size          # decided by the sbert model
    # params_dict['inference_type'] = inference_type
    params_dict['n_components'] = n_components
    # params_dict['model_type'] = model_type
    params_dict['hidden_sizes'] = hidden_sizes
    # params_dict['activation'] = activation
    params_dict['dropout'] = dropout
    # params_dict['learn_priors'] = learn_priors
    # params_dict['batch_size'] = batch_size
    params_dict['lr'] = lr
    params_dict['momentum'] = momentum
    params_dict['solver'] = solver
    params_dict['num_epochs'] = num_epochs

    return params_dict


def _init_config_dict(config_path:Path, model_name:str, dataset_path:Path, hyperparameters:dict, search_space_dict:dict, 
                      metrics:list[METRICS], monitor:METRICS,
                      search_behaviour:SEARCH_BEHAVIOUR, search_rs:int, search_n_iter:int):
    
    if not config_path.exists():
        config = {}

        sbert_params = _init_sbert_params(**hyperparameters['sbert_params'])
        countvect_params = _init_count_vectorizer_params(**hyperparameters['countvect_params'])
        ctm_params = _init_ctm_params(**hyperparameters['ctm_params'])

        config['model'] = model_name
        config['dataset_path'] = str(dataset_path)
        config['sbert_params'] = sbert_params
        config['countvect_params'] = countvect_params
        config['ctm_params'] = ctm_params

        if 'sbert_params' in search_space_dict:
            for k in search_space_dict['sbert_params'].keys():
                sbert_params.pop(k, '')     # add a default value to avoid key error
        if 'countvect_params' in search_space_dict:
            for k in search_space_dict['countvect_params'].keys():
                countvect_params.pop(k, '')
        if 'ctm_params' in search_space_dict:
            for k in search_space_dict['ctm_params'].keys():
                ctm_params.pop(k, '')

        config['search_space'] = search_space_dict
        config['metrics'] = list(map(lambda x: x.value, metrics))
        config['monitor'] = monitor.value

        config['search_behaviour'] = search_behaviour.value
        if search_behaviour == SEARCH_BEHAVIOUR.RANDOM_SEARCH:
            config['search_rs'] = search_rs
            config['search_n_iter'] = search_n_iter

        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)

        _print_message('Created config file at {}'.format(config_path))
        # print('Created config file at {}'.format(config_path))
    else:
        with open(config_path, 'r') as f:
            config = json.load(f)

        # check whether the input params are consistent with the config file
        assert config['model'] == model_name, 'input model_name is not consistent with the config["model"]'
        assert config['dataset_path'] == str(dataset_path), 'input dataset_path is not consistent with the config["dataset_path"]'
        assert config['metrics'] == list(map(lambda x: x.value, metrics)), 'input metrics is not consistent with config["metrics"]'
        assert config['monitor'] == monitor.value, 'input monitor is not consistent with config["monitor"]'
        assert config['search_behaviour'] == search_behaviour.value, 'input search_behaviour is not consistent with config["search_behaviour"]'
        if search_behaviour == SEARCH_BEHAVIOUR.RANDOM_SEARCH:
            assert config['search_rs'] == search_rs, 'input search_rs is not consistent with config["search_rs"]'
            assert config['search_n_iter'] == search_n_iter, 'input search_n_iter is not consistent with config["search_n_iter"]'

        # check whether the hyperparameters are consistent with the config file
        sbert_params = _init_sbert_params(**hyperparameters['sbert_params'])
        countvect_params = _init_count_vectorizer_params(**hyperparameters['countvect_params'])
        ctm_params = _init_ctm_params(**hyperparameters['ctm_params'])

        assert config['sbert_params'].keys() <= sbert_params.keys(), 'existing config["sbert_params"] contains additional hyperparameters'
        assert config['countvect_params'].keys() <= countvect_params.keys(), 'existing config["countvect_params"] contains additional hyperparameters'
        assert config['ctm_params'].keys() <= ctm_params.keys(), 'existing config["ctm_params"] contains additional hyperparameters'

        for key in sbert_params.keys() & config['sbert_params'].keys():
            assert sbert_params[key] == config['sbert_params'][key], 'existing config["sbert_params"] contains different hyperparameters'
        for key in countvect_params.keys() & config['countvect_params'].keys():
            assert countvect_params[key] == config['countvect_params'][key], 'existing config["countvect_params"] contains different hyperparameters'
        for key in ctm_params.keys() & config['ctm_params'].keys():
            assert ctm_params[key] == config['ctm_params'][key], 'existing config["ctm_params"] contains different hyperparameters'

        # check whether the search_space is consistent with the config file
        if 'sbert_params' in config['search_space']:
            assert config['search_space']['sbert_params'].keys() == search_space_dict['sbert_params'].keys(), 'input search_space_dict["sbert_params"] contains different hyperparameter keys than existing config["search_space"]["sbert_params"]'
            for k in search_space_dict['sbert_params'].keys():
                assert k in config['search_space']['sbert_params'], f'input search_space_dict["sbert_params"]["{key}"] contains value than existing config["search_space"]["sbert_params"]["{key}"]'
        if 'countvect_params' in config['search_space']:
            assert config['search_space']['countvect_params'].keys() == search_space_dict['countvect_params'].keys(), 'input search_space_dict["countvect_params"] contains different hyperparameter keys than existing config["search_space"]["countvect_params"]'
            for k in search_space_dict['countvect_params'].keys():
                assert k in config['search_space']['countvect_params'], f'input search_space_dict["countvect_params"]["{key}"] contains value than existing config["search_space"]["countvect_params"]["{key}"]'
        if 'ctm_params' in config['search_space']:
            assert config['search_space']['ctm_params'].keys() == search_space_dict['ctm_params'].keys(), 'input search_space_dict["ctm_params"] contains different hyperparameter keys than existing config["search_space"]["ctm_params"]'
            for k in search_space_dict['ctm_params'].keys():
                assert k in config['search_space']['ctm_params'], f'input search_space_dict["ctm_params"]["{key}"] contains value than existing config["search_space"]["ctm_params"]["{key}"]'
        
        _print_message('Loaded existing config file from {}'.format(config_path))
        _print_message('Hyperparameters and search space are consistent with the input parameters')
        # print('Loaded existing config file from {}'.format(config_path))
        # print('Hyperparameters and search space are consistent with the input parameters')

    return config



def _init_result_dict(result_path:Path, monitor_type:str):
    if not result_path.exists():
        result = {}

        result['best_metric'] = -float('inf')
        result['best_model_checkpoint'] = ""
        result['best_hyperparameters'] = dict()
        result["monitor_type"] = monitor_type
        result["log_history"] = list()

    else:
        with open(result_path, 'r') as f:
            result = json.load(f)

        assert result['monitor_type'] == monitor_type

        _print_message('Loaded existing result file from {}'.format(result_path))
        # print('Loaded existing result file from {}'.format(result_path))
    
    return result


from ctm_utils import _load_ctm_model

# their implementation is moved to utils script as it is also used in eval script.


from ctm_utils import _get_topics, _get_topic_word_metrix, _get_topic_document_metrix

# their implementation is moved to utils script as it may be used in eval script.


import pickle
from gensim import corpora
# from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS
# from contextualized_topic_models.datasets.dataset import CTMDataset

from ctm_dataset_creation import create_ctm_dataset

def model_search(X_contextual, X_bow, X, hyperparameters:dict, search_space:dict, save_folder:Path, dataset_path:Path,
                 additional_stopwords:list[str]=None,
                 metrics:list[METRICS]=[METRICS.C_NPMI], monitor:METRICS=METRICS.C_NPMI, 
                 save_each_models=True, run_from_checkpoints=False,
                 search_behaviour=SEARCH_BEHAVIOUR.GRID_SEARCH, search_rs=42, search_n_iter=10):
    
    config_json_path = save_folder.joinpath('config.json')
    result_json_path = save_folder.joinpath('result.json')

    if monitor not in metrics:
        raise Exception('monitor is not in metrics. Please modify the metrics passed in.')

    if run_from_checkpoints:
        if not save_folder.exists():
            _print_message('Save folder:' + str(save_folder.resolve()) + ' does not exist. Function terminates.')
            # print('Save folder:' + str(save_folder.resolve()) + ' does not exist. Function terminates.')
            raise Exception('No checkpoints found. Function terminates.')
        
        # check for existing configs
        if not config_json_path.exists():
            raise Exception('No config.json found. Function terminates.')
        
        # check for existing results
        if not result_json_path.exists():
            _print_message('No result.json is found. Assuming no existing checkpoints.')
            # print('No result.json is found. Assuming no existing checkpoints.')
    else:
        if save_folder.exists():
            raise Exception('Checkpoints found. Please delete the checkpoints or set run_from_checkpoints=True. Function terminates.')

    if not save_folder.exists():
        save_folder.mkdir(parents=True)

    config = _init_config_dict(config_json_path, 'ctm', dataset_path, hyperparameters, search_space,
                               metrics, monitor, search_behaviour, search_rs, search_n_iter)
    result = _init_result_dict(result_json_path, monitor.value)

    _print_message('Search folder: {}'.format(save_folder))
    # print('Search folder: {}'.format(save_folder))

    # init
    best_model_path = result['best_model_checkpoint']
    best_metric_score = result['best_metric']
    best_model = _load_ctm_model(Path(best_model_path),
                                 result['best_hyperparameters']['ctm_params']) if best_model_path != "" else None
    best_hyperparameters = result['best_hyperparameters']


    _print_message('Best model checkpoint: {}'.format(best_model_path))
    _print_message('Best metric score: {}'.format(best_metric_score))
    _print_message('Best model: {}'.format(best_model))
    # print(f'Best model checkpoint: {best_model_path}')
    # print(f'Best metric score: {best_metric_score}')
    # print(f'Best model: {best_model}')

    # search
    # like bertopic, we create a temp dict for initiating the search space
    # then we apply sklearn parameter sampler / parameter grid to get the search space
    temp_search_space = {}
    for k, v in search_space.items():
        for kk, vv in v.items():
            temp_search_space[k + '__' + kk] = vv

    if search_behaviour == SEARCH_BEHAVIOUR.RANDOM_SEARCH:
        search_iterator = ParameterSampler(temp_search_space, search_n_iter, random_state=search_rs)
    elif search_behaviour == SEARCH_BEHAVIOUR.GRID_SEARCH:
        search_iterator = ParameterGrid(temp_search_space)

    print('\n')

    for search_space_dict in search_iterator:

        # unwrap the search space dict

        model_name = ''

        _sbert_params = {}
        _countvect_params = {}
        _ctm_params = {}

        for k, v in search_space_dict.items():
            if k.startswith('sbert_params'):
                _sbert_params[k.split('__')[1]] = v
                model_name += 'sb_' + k.split('__')[1] + '_' + str(v) + '_'
            elif k.startswith('countvect_params'):
                _countvect_params[k.split('__')[1]] = v
                model_name += 'cvect_' + k.split('__')[1] + '_' + str(v) + '_'
            elif k.startswith('ctm_params'):
                _ctm_params[k.split('__')[1]] = v
                model_name += 'ctm_' + k.split('__')[1] + '_' + str(v) + '_'

        model_name = model_name[:-1]     # remove the last '_'

        model_path = save_folder.joinpath(config['model'] + '_' + model_name)

        # check whether the model exists
        if model_path.exists():
            _print_message('Skipping current search space: {}'.format(search_space_dict))
            # print('Skipping current search space: {}'.format(search_space_dict))
            continue

    
        ##########
        # Training starts
        ##########

        _print_message('Current search space: {}'.format(search_space_dict))
        # print('Current search space: {}'.format(search_space_dict))

        sbert_params = deepcopy(config['sbert_params'])     # deepcopy just for safety (not messing up with the original config)
        countvect_params = deepcopy(config['countvect_params'])
        ctm_params = deepcopy(config['ctm_params'])

        sbert_params.update(_sbert_params)
        countvect_params.update(_countvect_params)
        ctm_params.update(_ctm_params)

        countvect_params['ngram_range'] = tuple(countvect_params['ngram_range'])     # convert list to tuple

        ##########
        # Preprocessing
        ##########

        # for re-producting the result (and inferencing)
        # we need to load the vectorizer, do the exact steps in preprocessing for creating bow
        # then create a CTMDataset for inferencing

        # create bow
        # vectorizer = CountVectorizer(
        #     stop_words="english" if additional_stopwords is None else list(ENGLISH_STOP_WORDS.union(additional_stopwords)),
        #     analyzer='word',
        #     **countvect_params)
        
        # vectorizer = vectorizer.fit(X_bow)
        # vocab = vectorizer.get_feature_names_out()
        # vocab_set = set(vocab)

        # preprocessed_docs_tmp = [' '.join([w for w in doc.split() if w in vocab_set])
        #                     for doc in X_bow]
        
        # text_for_contextual, text_for_bow = [], []
        # X_tmp = []

        
        # assert len(X_contextual) == len(preprocessed_docs_tmp), f'len(text_for_contextual): {len(X_contextual)}, len(preprocessed_docs_tmp): {len(preprocessed_docs_tmp)}'
        # assert len(X) == len(X_contextual), f'len(X): {len(X)}, len(text_for_contextual): {len(X_contextual)}'
        
        # # remove empty docs
        # for i, (tfc, tfb) in enumerate(zip(X_contextual, preprocessed_docs_tmp)):
        #     if len(tfb) == 0 or len(tfc) == 0:
        #         continue
                
        #     text_for_contextual.append(tfc)
        #     text_for_bow.append(tfb)
        #     X_tmp.append(X[i])

        # assert len(text_for_contextual) == len(text_for_bow), f'len(text_for_contextual_tmp): {len(text_for_contextual)}, len(text_for_bow_tmp): {len(text_for_bow)}'
        # assert len(X_tmp) == len(text_for_contextual), f'len(X_tmp): {len(X_tmp)}, len(text_for_contextual_tmp): {len(text_for_contextual)}'


        # train_bow_embeddings = vectorizer.transform(text_for_bow)

        
        # # isntead of using default TopicModelDataPreparation(), build the dataset by referencing the source code of it
        # # source code: https://github.com/MilaNLProc/contextualized-topic-models/blob/master/contextualized_topic_models/utils/data_preparation.py
        # # according to the source code, we only need to create the idx2token, then use the countvectorizer above to build the dataset
        # idx2token = {k: v for k, v in zip(range(0, len(vocab)), vocab)}

        
        # # create sbert embeddings
        # if platform.system() == 'Linux' or platform.system() == 'Windows':
        #     device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        # else:
        #     device = torch.device('mps')        # m-series machine
        

        # # check existing embeddings
        # # reuse them if found
        # embeddings_path = save_folder.joinpath(f'embeddings_{sbert_params["model_name_or_path"]}.pkl')
        # if embeddings_path.exists():
        #     with open(embeddings_path, 'rb') as f:
        #         embeddings = np.load(f)

        #     assert embeddings.shape[0] == len(text_for_contextual), f'embeddings.shape[0]: {embeddings.shape[0]}, len(text_for_contextual): {len(text_for_contextual)}'

        #     _print_message(f'Found existing sbert embeddings at {embeddings_path}. Reusing them.')
        #     # print(f'Found existing sbert embeddings at {embeddings_path}. Reusing them.')
        # else:
        #     embeddings = bert_embeddings_from_list(text_for_contextual, **sbert_params, device=device)

        #     with open(embeddings_path, 'wb') as f:
        #         np.save(f, embeddings)
         


        # # tp = TopicModelDataPreparation()
        # # training_dataset = tp.fit(text_for_contextual=text_for_contextual, text_for_bow=text_for_bow, custom_embeddings=embeddings)
        # training_dataset = CTMDataset(
        #     X_contextual=embeddings,
        #     X_bow=train_bow_embeddings,
        #     idx2token=idx2token,
        #     labels=None
        # )        

        training_dataset, vectorizer, embeddings, X_tmp, _ = create_ctm_dataset(
            X_contextual, X_bow, X,
            sbert_params, save_folder,
            vectorizer=None,            # pass None to ask the function to create a new sklearn CountVectorizer
            countvect_params=countvect_params,
            additional_stopwords=additional_stopwords)

        vocab = vectorizer.get_feature_names_out()
        
        # ctm

        ctm_params['bow_size'] = len(vocab)
        ctm_params['contextual_size'] = embeddings.shape[1]
        ctm_params['hidden_sizes'] = tuple(ctm_params['hidden_sizes'])     # convert list to tuple

        ctm = CombinedTM(**ctm_params)
        ctm.device = device
        ctm.fit(training_dataset, verbose=True)

        ##########
        # Training ends
        ##########

        ##########
        # Evaluation starts
        ##########

        # init data for gensim coherence model
        topic_words = _get_topics(ctm, k=10)
        topics = ctm.get_predicted_topics(training_dataset, n_samples=20)

        documents = pd.DataFrame({"Document": X_tmp,
                                "ID": range(len(X_tmp)),
                                "Topic": topics})
        
        docs_per_topic = documents.groupby(['Topic'], as_index=False).agg({'Document': ' '.join})
        texts = [doc.split() for doc in docs_per_topic.Document.values]
        
        dictionary = corpora.Dictionary(texts)
        corpus = [dictionary.doc2bow(text) for text in texts]

        # init octis format result for convenience
        result_octis = {}
        result_octis['topics'] = topic_words
        result_octis['topic-word-matrix'] = _get_topic_word_metrix(ctm)
        result_octis['topic-document-matrix'] = _get_topic_document_metrix(ctm, training_dataset, n_samples=20)

        _print_message('Compute evaluation metrics')
        # print('Compute evaluation metrics')

        metrics_score = dict()

        for metric in metrics:
            if metric in COHERENCE_MODEL_METRICS:
                coherencemodel = CoherenceModel(
                    topics=topic_words, 
                    texts=texts, 
                    corpus=corpus, 
                    dictionary=dictionary, 
                    coherence=metric.value, 
                    topn=10,
                    processes=3
                )
                score = coherencemodel.get_coherence()
            elif metric == METRICS.TOPIC_DIVERSITY:
                score = compute_topic_diversity(result_octis, topk=10)
            elif metric == METRICS.INVERTED_RBO:
                score = compute_inverted_rbo(result_octis, topk=10)
            elif metric == METRICS.PAIRWISE_JACCARD_SIMILARITY:
                score = compute_pairwise_jaccard_similarity(result_octis, topk=10)
            else:
                raise Exception('Unknown metric: {}'.format(metric.value))

            metrics_score[metric.value] = score

            _print_message('Evaluation metric ({}): {}'.format(metric.value, score))
            # print(f'Evaluation metric ({metric.value}): {score}')

        monitor_score = metrics_score[monitor.value]

        ##########
        # Evaluation ends
        ##########

        ##########
        # Save models
        ##########

        if not model_path.exists():
            model_path.mkdir()
        
        if save_each_models:
            ctm.save(models_dir=model_path)

        # save the vectorizer
        # then we can reproduce the result better
        vectorizer_path = model_path.joinpath('count_vectorizer.pkl')
        with open(vectorizer_path, 'wb') as f:
            pickle.dump(vectorizer, f)
        

        ##########
        # Save models ends
        ##########

        ###########
        # Update result dict and json file
        ###########
            
        model_hyperparameters = {
            'sbert_params': sbert_params,
            'countvect_params': countvect_params,
            'ctm_params': ctm_params
        }

        if monitor_score > best_metric_score:
            best_metric_score = monitor_score
            best_model_path = model_path
            best_model = ctm
            best_hyperparameters = model_hyperparameters

        model_log_history = dict()
        model_log_history.update(metrics_score)
        model_log_history['model_name'] = model_name
        model_log_history['hyperparameters']  = model_hyperparameters

        result['best_metric'] = best_metric_score
        result['best_model_checkpoint'] = str(best_model_path)
        result['best_hyperparameters'] = best_hyperparameters
        result['log_history'].append(model_log_history)

        # save result
        with open(result_json_path, 'w') as f:
            json.dump(result, f, indent=2)

        _print_message('Saved result.json at: {}'.format(result_json_path))        
        # print('Saved result.json at:', result_json_path)
        print('\n\n')
    
    _print_message('Search ends')
    # print('Search ends')
    return best_model, best_model_path, best_hyperparameters



# load/create custom stopwords stored in a txt from dataset folder
from pathlib import Path

custom_stopwords_path = Path('../../dataset/topic_modelling/stopwords.txt')
custom_stowords_games_path = Path('../../dataset/topic_modelling/stopwords_games.txt')
game_name_list_path = Path('../../dataset/topic_modelling/game_name_list.txt')

with open(custom_stopwords_path, 'r') as f:
    custom_stopwords = f.read().splitlines()

with open(custom_stowords_games_path, 'r') as f:
    custom_stowords_games = f.read().splitlines()

with open(game_name_list_path, 'r') as f:
    game_name_list = f.read().splitlines()

# also include the stopword list from nltk
from nltk.corpus import stopwords
nltk_stopwords = stopwords.words('english')

custom_stopwords = custom_stopwords + custom_stowords_games + game_name_list + nltk_stopwords
custom_stopwords = list(filter(lambda x: len(x) > 0, custom_stopwords))     # remove empty string
custom_stopwords = set(custom_stopwords)

# print(custom_stopwords)
print(len(custom_stopwords))



# grid search / random search

# hyperparameters
sbert_params = _init_sbert_params(model_name_or_path=sbert_model_name)              # should not be in search space !!!
countvect_params = _init_count_vectorizer_params(max_features=2000, ngram_range=[1,1])
ctm_params = _init_ctm_params(
    n_components=10, 
    hidden_sizes=[100, 100], 
    dropout=0.2, lr=2e-3, momentum=0.99, solver="adam", 
    num_epochs=25       # original default value is 100 (in LDAProd), some tested with 50
)

search_space_dict = {
    # 'countvect_params': {
    #     'max_features' : [1500, 2000, 2500],
    #     'ngram_range': [[1, 1], [1, 2]]     # datatype is list as json does not support tuple
    # },
    'ctm_params':{
        'n_components': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        # 'hidden_sizes': [(100, 100), (200, 200), (100, 100, 100), (200, 200, 200)],
        # 'num_epochs':[50]
    }
}

dataset_path_config = dataset_path.relative_to(dataset_path.parent.parent.parent.parent)

search_behaviour = SEARCH_BEHAVIOUR.GRID_SEARCH
# search_behaviour = SEARCH_BEHAVIOUR.RANDOM_SEARCH

# training_datetime = datetime.now()
training_datetime = datetime(2024, 2, 24, 14, 32, 52)
if genre >= 0:
    training_folder_p = Path(f'category_{str(genre)}_unique_review_text')
    training_folder = Path(f'ctm{"[split]" if split_sentences else ""}_genre_{str(genre)}_{search_behaviour.value}_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
else:
    training_folder_p = Path(f'category_all_unique_review_text')
    training_folder = Path(f'ctm{"[split]" if split_sentences else ""}_{search_behaviour.value}_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
training_folder = training_folder_p.joinpath(training_folder)

best_model, best_model_path, best_hyperparameters = model_search(
    X_contextual, X_bow, X,
    hyperparameters={
        'sbert_params': sbert_params,
        'countvect_params': countvect_params,
        'ctm_params': ctm_params
    },
    search_space=search_space_dict,
    save_folder=training_folder,
    dataset_path=dataset_path_config, additional_stopwords=custom_stopwords,
    metrics=[METRICS.C_NPMI, METRICS.C_V, METRICS.UMASS, METRICS.C_UCI, METRICS.TOPIC_DIVERSITY, METRICS.INVERTED_RBO, METRICS.PAIRWISE_JACCARD_SIMILARITY],
    monitor=METRICS.C_NPMI,
    save_each_models=True,
    run_from_checkpoints=True,
    search_behaviour=search_behaviour,
    # search_rs=42,
    # search_n_iter=50
)

print(); print(); _print_message('Training completed')