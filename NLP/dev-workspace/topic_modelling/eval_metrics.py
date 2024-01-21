from enum import Enum
import itertools
from rbo import rbo

import numpy as np

class METRICS(Enum):
    # coherence metrics
    UMASS = 'u_mass'
    C_V = 'c_v'
    C_UCI = 'c_uci'
    C_NPMI = 'c_npmi'

    # diversity metrics
    TOPIC_DIVERSITY = 'topic_diversity'
    INVERTED_RBO = 'inverted_rbo'

    # similarity metrics
    PAIRWISE_JACCARD_SIMILARITY = 'pairwise_jaccard_similarity'

COHERENCE_MODEL_METRICS = set([METRICS.UMASS, METRICS.C_V, METRICS.C_UCI, METRICS.C_NPMI])

class SEARCH_BEHAVIOUR(Enum):
    GRID_SEARCH = 'grid_search'
    RANDOM_SEARCH = 'random_search'


def compute_topic_diversity(result, topk=10):
    topics = result['topics']

    if topics is None:
        return 0

    if topk > len(topics[0]):
        raise Exception('Words in topics are less than ' + str(topk))
    else:
        unique_words = set()
        for topic in topics:
            unique_words = unique_words.union(set(topic[:topk]))
        td = len(unique_words) / (topk * len(topics))
        return td
    
def get_word2index(list1, list2):
    words = set(list1)
    words = words.union(set(list2))
    word2index = {w: i for i, w in enumerate(words)}
    return word2index
    
def compute_inverted_rbo(result, topk=10, weight=0.9):
    topics = result['topics']

    if topics is None:
        return 0
    
    if topk > len(topics[0]):
        raise Exception('Words in topics are less than topk')
    else:
        collect = []
        for list1, list2 in itertools.combinations(topics, 2):
            word2index = get_word2index(list1, list2)
            indexed_list1 = [word2index[word] for word in list1]
            indexed_list2 = [word2index[word] for word in list2]
            rbo_val = rbo(indexed_list1[:topk], indexed_list2[:topk], p=weight)[2]
            collect.append(rbo_val)
        return 1 - np.mean(collect)
    
def compute_pairwise_jaccard_similarity(result, topk=10):
    topics = result['topics']
    sim = 0
    count = 0

    if topics is None:
        return 0
    
    if topk > len(topics[0]):
        raise Exception('Words in topics are less than topk')
    else:
        for list1, list2 in itertools.combinations(topics, 2):
            intersection = len(list(set(list1[:topk]).intersection(list2[:topk])))
            union = (len(list1[:topk]) + len(list2[:topk])) - intersection
            count = count + 1
            sim = sim + (float(intersection) / union)
        return sim / float(count)