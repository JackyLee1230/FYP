import numpy as np

from pathlib import Path

from bertopic import BERTopic

def _load_bertopic_model(model_path:Path):
    topic_model = BERTopic.load(str(model_path))

    return topic_model


##########
# Evaluation functions
##########

def _get_topics(topic_model):
    topic_list = []
    empty_topic_l_idx = []

    for idx, topics in topic_model.get_topics().items():
        if idx < 0:
            continue

        topics_sorted = sorted(topics, key=lambda x: x[1], reverse=True)
        topic_l = [t[0] for t in topics_sorted if t[0].strip() != '']

        # it's possible that resulting in an empty list
        # also, topic with only one word fails at calculating NPMI
        if len(topic_l) <= 1:
            empty_topic_l_idx.append(idx)
            continue

        topic_list.append(topic_l)
        # print(len(topic_l))

    return topic_list, empty_topic_l_idx

def _get_topic_word_matrix(topic_model, empty_topic_idxs):
    # use ctfidf value to calculate the probability of a word assigned to a topic
    # but this is not the probability of a word in a topic
    # maybe there's a better way

    c_tfidf_all = topic_model.c_tf_idf_.todense()

    topic_word_matrix = np.exp(c_tfidf_all) / np.exp(c_tfidf_all).sum(axis=1)

    # remove empty topics from the largest index
    for idx in empty_topic_idxs[::-1]:
        topic_word_matrix = np.delete(topic_word_matrix, idx, axis=0)

def _get_topic_document_matrix(probs, empty_topic_idxs):
    topic_document_matrix = probs

    for idx in empty_topic_idxs[::-1]:
        topic_document_matrix = np.delete(topic_document_matrix, idx, axis=0)

    return topic_document_matrix.T