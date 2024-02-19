# Script contains the function to create CTM dataset object
# for training and evaluation

import pickle
import warnings
import numpy as np
import torch
import platform

from pathlib import Path

from sentence_transformers import SentenceTransformer

from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS
from contextualized_topic_models.datasets.dataset import CTMDataset


def create_ctm_dataset(X_contextual:list[str], X_bow:list[str], X:list[str],
                       sbert_params, save_folder:Path,
                       vectorizer=None,      # keep None as for training, to create a new sklearn countvectorizer object
                       countvect_params=None, 
                       additional_stopwords:list[str]=None,        # for training
                       X_contextual_embedding_path:Path=None):       # for evaluation)

    # create bow
    if vectorizer is None:
        vectorizer = CountVectorizer(
            stop_words="english" if additional_stopwords is None else list(ENGLISH_STOP_WORDS.union(additional_stopwords)),
            analyzer='word',
            **countvect_params)
        
        vectorizer = vectorizer.fit(X_bow)
        
    
    vocab = vectorizer.get_feature_names_out()
    vocab_set = set(vocab)

    preprocessed_docs_tmp = [' '.join([w for w in doc.split() if w in vocab_set])
                        for doc in X_bow]

    text_for_contextual, text_for_bow = [], []
    X_tmp = []          # for evaluation

    assert len(X_contextual) == len(preprocessed_docs_tmp), f'len(text_for_contextual): {len(X_contextual)}, len(preprocessed_docs_tmp): {len(preprocessed_docs_tmp)}'

    # remove empty docs
    index_to_remove = []
    for i, (tfc, tfb) in enumerate(zip(X_contextual, preprocessed_docs_tmp)):
        if len(tfb) == 0 or len(tfc) == 0:
            index_to_remove.append(i)
            continue
            
        text_for_contextual.append(tfc)
        text_for_bow.append(tfb)
        X_tmp.append(X[i])

    assert len(text_for_contextual) == len(text_for_bow), f'len(text_for_contextual_tmp): {len(text_for_contextual)}, len(text_for_bow_tmp): {len(text_for_bow)}'
    assert len(X_tmp) == len(text_for_contextual), f'len(X_tmp): {len(X_tmp)}, len(text_for_contextual_tmp): {len(text_for_contextual)}'



    train_bow_embeddings = vectorizer.transform(text_for_bow)


    # isntead of using default TopicModelDataPreparation(), build the dataset by referencing the source code of it
    # source code: https://github.com/MilaNLProc/contextualized-topic-models/blob/master/contextualized_topic_models/utils/data_preparation.py
    # according to the source code, we only need to create the idx2token, then use the countvectorizer above to build the dataset
    idx2token = {k: v for k, v in zip(range(0, len(vocab)), vocab)}

    # create sbert embeddings
    if platform.system() == 'Linux' or platform.system() == 'Windows':
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    else:
        device = torch.device('mps')        # m-series machine
    

    # check existing embeddings
    # reuse them if found
    embeddings_path = X_contextual_embedding_path if X_contextual_embedding_path else save_folder.joinpath(f'embeddings_{sbert_params["model_name_or_path"]}.pkl')
    if embeddings_path.exists():
        with open(embeddings_path, 'rb') as f:
            embeddings = np.load(f)

        try:
            assert embeddings.shape[0] == len(text_for_contextual), f'embeddings.shape[0]: {embeddings.shape[0]}, len(text_for_contextual): {len(text_for_contextual)}'
            
            # assert successful
            print(f'Found existing sbert embeddings at {embeddings_path}. Reusing them.')
        except AssertionError as e:
            print('Shape of existing embeddings does not match the length of text_for_contextual. Recreating the embeddings.')
            print(f'embeddings.shape[0]: {embeddings.shape[0]}, len(text_for_contextual): {len(text_for_contextual)}')

            sbert_model = SentenceTransformer(**sbert_params, device=device)
            embeddings = bert_embeddings_from_list(text_for_contextual, sbert_model, batch_size=64)
            
        # _print_message(f'Found existing sbert embeddings at {embeddings_path}. Reusing them.')
        # print(f'Found existing sbert embeddings at {embeddings_path}. Reusing them.')
    else:
        sbert_model = SentenceTransformer(**sbert_params, device=device)
        embeddings = bert_embeddings_from_list(text_for_contextual, sbert_model, batch_size=64)

        with open(embeddings_path, 'wb') as f:
            np.save(f, embeddings)
        

    # tp = TopicModelDataPreparation()
    # training_dataset = tp.fit(text_for_contextual=text_for_contextual, text_for_bow=text_for_bow, custom_embeddings=embeddings)
    dataset = CTMDataset(
        X_contextual=embeddings,        # depends on X_contextual -> preprocessed_docs_tmp, which depends on the vectorizer
        X_bow=train_bow_embeddings,     # depends on preprocessed_docs_tmp, which depends on the vectorizer
        idx2token=idx2token,            # depends on vectorizer
        labels=None
    )

    return dataset, \
        vectorizer, embeddings, X_tmp, index_to_remove      # additional return for training (first three), and evaluation (last two)

##########
# Other utils
##########

# copy from: https://github.com/MilaNLProc/contextualized-topic-models/blob/master/contextualized_topic_models/utils/data_preparation.py#L44
# call bert_embeddings_from_list() to produce embeddings by ourself

# import warnings

def bert_embeddings_from_list(
    texts, 
    sbert_model,
    batch_size=32, 
    max_seq_length=None,            # 128 is the default valule in TopicModelDataPreparation() init. Passing none to use the default value of each model
    ):
    """
    Creates SBERT Embeddings from a list
    """

    if max_seq_length is not None:
        sbert_model.max_seq_length = max_seq_length
    else:
        max_seq_length = sbert_model.max_seq_length

    check_max_local_length(max_seq_length, texts)

    return np.array(sbert_model.encode(texts, batch_size=batch_size, show_progress_bar=True))


def check_max_local_length(max_seq_length, texts):
    max_local_length = np.max([len(t.split()) for t in texts])
    if max_local_length > max_seq_length:
        warnings.simplefilter("always", DeprecationWarning)
        warnings.warn(
            f"the longest document in your collection has {max_local_length} words, the model instead "
            f"truncates to {max_seq_length} tokens."
        )