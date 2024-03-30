import traceback
import chromadb

import langchain 
langchain.debug = True      # show debug stuff
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter, TokenTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_core.prompts import PromptTemplate

from transformers import AutoTokenizer

# mistralAI
from langchain_mistralai.chat_models import ChatMistralAI
# from langchain_mistralai.embeddings import MistralAIEmbeddings
from mistralai_embeddings import CustomMistralAIEmbeddings
from mistralai.models.common import UsageInfo

import pandas as pd


import json
import os
import sys
from collections import deque
from pathlib import Path
from datetime import datetime
from hashlib import sha224


import _prompts
from _llm_rag_utils import _print_message, _parsing_json_single, _parsing_json_multiple, _calculate_token_usage, RagType, GAME_NAMES_TO_DB_NAME
import _pergame_tldr
import _llm_sample_reviews
from typing import Tuple, List, Dict

# OLLAMA_IP = os.environ.get('OLLAMA_IP', 'localhost')
llm_rag_folder = Path((os.path.dirname(os.path.abspath(__file__))))
# MISTRAL_API_KEY = get_mistral_API_key(llm_rag_folder)
MISTRAL_API_KEY = os.environ["MISTRAL_API_KEY"]

# global constants
GAME_ASPECTS = ['Gameplay', 'Narrative', 'Accessibility', 'Sound', 'Graphics & Art Design', 'Performance', 'Bug', 'Suggestion', 'Price', 'Overall']

# global variables
# llm_mistral7b = Ollama(
#     model='mistral:7b-instruct-v0.2-q4_0', temperature=0.2,                         # lower temperature for more deterministic results
#     base_url = 'http://localhost:11434'
# )
 
# llm_mixtral8x7b = Ollama(
# llm_mistral7b = Ollama(
#     model='mixtral:8x7b-instruct-v0.1-q4_0', temperature=0.2,                         # lower temperature for more deterministic results
#     base_url = 'http://localhost:11434'
# )


llm_mistralai = ChatMistralAI(
    model="open-mixtral-8x7b",
    mistral_api_key = MISTRAL_API_KEY,
    temperature = 0.4,
    timeout=180,
    # verbose=True
)


# chroma_client = chromadb.HttpClient(host='localhost', port=8000)
# our first plan is to run on a separate docker container
# however since it feels less maintainable with docker volume
# just use persistent client shd be good for demo
chroma_client = chromadb.PersistentClient(path=str(llm_rag_folder.joinpath('chromadb_storage')))

def _check_spam(review:str) -> Tuple[bool, Dict]:
    '''
    Check if the review is a spam or not with LLM

    Args:
        review (str): the review text
    
    Returns:
        bool: True if the review is a spam, False otherwise
        dict: a dictionary with key as an identifier of this func, and value as a list of token usage stats for the generating spam response dict
    '''

    # store token usage for the two LLM call
    token_usage_list = []
    token_usage_stats = {"spam_tokens": token_usage_list}

    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm_mistralai

    # wrap with try-except block, as exception may be raised (e.g. mistralai.exceptions.MistralAPIStatusException: Status: 500. Message: {"object":"error","message":"Service unavailable.","type":"internal_server_error","param":null,"code":"1000"})
    try:
        response_01 = chain_01.invoke({
            "review": review,
        })
    except:
        print(traceback.format_exc())
        return True, token_usage_stats         # default return true (i.e. isSpam)
    else:
        _print_message(f'LLM result for spam check: {response_01}')
    
    token_usage_list.append(response_01.response_metadata['token_usage'])

    chat_prompt_02 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01),
        ("ai", response_01.content),            # .content to get the response, same as below
        ("human", _prompts.SPAM_TEMPLATE_02)
    ])

    chain_02 = chat_prompt_02 | llm_mistralai

    try:
        response_02 = chain_02.invoke({         # response_02 is an object with str output like: '''content='NO.' response_metadata={'token_usage': {'prompt_tokens': 2568, 'total_tokens': 2570, 'completion_tokens': 2}, 'model': 'open-mixtral-8x7b', 'finish_reason': 'stop'}'''
            "review": review
        })
    except:
        print(traceback.format_exc())
        return True, token_usage_stats     # default return true (i.e. isSpam)
    else:
        _print_message(f'LLM result_2 for spam check: {response_02}')
    

    token_usage_list.append(response_02.response_metadata['token_usage'])

    response_02 = response_02.content         # to get the response string


    if "YES" in response_02 or "Yes" in response_02 or "yes" in response_02:
        return True, token_usage_stats
    else:
        return False, token_usage_stats
    

def _create_review_obj(review:str) -> dict:
    '''Create a review object with the review text and a hash of the review text as the key
    for creating a temporary in-menory db for one-time RAG

    Args:
        review (str): the review text
    
    Returns:
        dict: a review object with the review text, datetime and hash code for creating a temporary in-memory db
    '''
    review_obj = {
        "review_text": review,
        "datetime": datetime.now()
    }

    hash = sha224(str(review).encode()).hexdigest()
    review_obj['hash'] = hash

    return review_obj


def _get_aspect_content_per_review(review:str) -> Tuple[Dict, Dict]:
    '''Get description of each aspect of the game from a single review text. One of the two entrance functions for getting content per aspect.
    (Another function is _get_aspect_content_per_game, which gets the content per aspect from multiple critic reviews of the game stored in the db)

    Args:
        review (str): the review text
    
    Returns:
        dict: a dictionary with the aspects as the key and the description of the aspect as the value
        dict: a dictionary with the key as different stages of the process, and value as a list of token usage stats for the generating aspect response dict and embedding token usage for RAG
    '''

    aspect_response_token_usage_list = []
    aspect_response_embedding_tokens_list = []
    token_usage_stats = {
        "aspect_response_tokens": aspect_response_token_usage_list,
        "aspect_response_embedding_tokens": aspect_response_embedding_tokens_list
    }

    _review_obj = _create_review_obj(review)

    _rag_request = {
        "type": RagType.PER_REVIEW,
        "payload" : _review_obj
    }

    db, retriever, embedding_func, embedding_usage_info_01 = _get_rag_documents(_rag_request)
    aspect_response_token_usage_list.append(embedding_usage_info_01)

    # sanity check onlt, the PER_REVIEW enum is defined and a db will always be returned
    if db is None:
        return None, token_usage_stats
    
    aspects_response, chain_llm_output_json_list, embedding_usage_info_list = _get_aspects_content(db, retriever, embedding_func)
    aspect_response_token_usage_list.extend(chain_llm_output_json_list)
    aspect_response_embedding_tokens_list.extend(embedding_usage_info_list)

    return aspects_response, token_usage_stats


def _get_aspect_content_per_game(game_name:str) -> Tuple[Dict, Dict]:
    '''Get description of each aspect of the game. It will search for critic reviews of the game stored in the db and get the description of each aspect through LLM. One of the two entrance functions for getting content per aspect.
    (Another function is _get_aspect_content_per_review, which gets the content per aspect from a single review text)
    
    Args:
        game_name (str): the name of the game
    
    Returns:
        dict: a dictionary with the aspects as the key and the description of the aspect as the value
        dict: a dictionary with the token usage stats for the generating aspect response dict and embedding token usage for RAG
    '''

    aspect_response_token_usage_list = []
    aspect_response_embedding_tokens_list = []
    token_usage_stats = {
        "aspect_response_tokens": aspect_response_token_usage_list,
        "aspect_response_embedding_tokens": aspect_response_embedding_tokens_list
    }

    # sanity check
    if game_name not in set(GAME_NAMES_TO_DB_NAME.keys()):
        return None, token_usage_stats

    _rag_request = {
        "type": RagType.PER_GAME,
        "payload": {
            "game_name": game_name,
            "db_name": GAME_NAMES_TO_DB_NAME[game_name]
        }
    }

    db, retriever, embedding_func, embedding_usage_info_01 = _get_rag_documents(_rag_request)
    aspect_response_embedding_tokens_list.append(embedding_usage_info_01)

    # sanity check only, the PER_GAME enum is defined and a db will always be returned
    if db is None:
        return None, token_usage_stats
    
    aspects_response, chain_llm_output_json_list, embedding_usage_info_list = _get_aspects_content(db, retriever, embedding_func)
    aspect_response_token_usage_list.extend(chain_llm_output_json_list)
    aspect_response_embedding_tokens_list.extend(embedding_usage_info_list)

    # return aspects_response, chain_llm_output_json_list, (embedding_usage_info_01, embedding_usage_info_list)
    return aspects_response, token_usage_stats


def _get_rag_documents(_rag_request:dict):
    '''Get the documents from vector db. If the request is for per review, then create a temporary in-memory db. If the request is for per game, then get from the persistent storage docker client

    Args:
        _rag_request (dict): a rag request object with the type (per review or per game).
    
    Returns:
        Chroma: the db object
        a retriever object for RAG with LangChain
        embedding_func: the embedding function used
        dict: a dictionary with the token usage stats of the embedding function
    '''

    embedding_stats_deque = deque()

    mistralai_embedding = CustomMistralAIEmbeddings(
        model="mistral-embed",
        mistral_api_key=MISTRAL_API_KEY,
        timeout=300,
        embedding_stats_deque=embedding_stats_deque
    )
    embedding_func = mistralai_embedding        # use mistralAI for embeddings
    
    # instead of using any tokentext splitter, we can use the tokenizer of the model itself. As the tokenizer is available in HuggingFace
    tokenizer = AutoTokenizer.from_pretrained(llm_rag_folder.joinpath("Mixtral-8x7B-Instruct-v0.1_tokenizer"))
    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(tokenizer, chunk_size=250, chunk_overlap=40)

    if _rag_request['type'] == RagType.PER_REVIEW:
        _payload = _rag_request['payload']
        review = _payload['review_text']
        _collection_name = _payload['hash']
        
        docs = text_splitter.create_documents([review], metadatas=[{"source":"review_01"}])

        db = Chroma.from_documents(
            docs, embedding_func,
            collection_name=_collection_name
        )

    elif _rag_request['type'] == RagType.PER_GAME:
        _payload = _rag_request['payload']
        _collection_name = _payload['db_name']

        try:
            db = Chroma(collection_name=_collection_name, client=chroma_client, embedding_function=embedding_func)       # get the collection from the docker client (the docker client provides persistent memory)
        except:
            print(f'Failed to create a db for the collection {_collection_name}. Exiting...')
            print(traceback.format_exc())
            db = None

    if db is None:
        return None, None, None, {}
    
    retriever = db.as_retriever(search_kwargs={"k": 5})
    try:
        embedding_stats = embedding_stats_deque.popleft()           # get embedding token usage
    except IndexError:
        embedding_stats = []        # no embedding stats

    _print_message(f'Embedding stats: {embedding_stats}')
    embedding_usage_info_01 = _process_embedding_stats(embedding_stats)

    # n_docs in the collection
    n_docs = len(db.get()['documents'])
    _print_message(f'Number of documents in the collection: {n_docs}')

    return db, retriever, embedding_func, embedding_usage_info_01
            

    
def _get_aspects_content(db, retriever, embedding_func) -> Tuple[Dict, List, List]:
    '''Prompt LLM to get the description of each aspect of the game using the review text retrieved from the db as the context
    
    Args:
        db (Chroma): the db object
        retriever: the retriever object for RAG with LangChain
        embedding_func: the embedding function used in db
    
    Returns:
        dict: a dictionary with the aspects as the key and the description of the aspect as the value
        list: a list of token usage stats for each LLM call (completion model)
        list: a list of token usage stats for each LLM call (embedding model)
    '''

    # get the documents from the db
    n_docs = len(db.get()['documents'])
    _print_message(f'Number of documents in the collection @_get_aspects_content: {n_docs}')


    # if the text exceeds roughtly 1000 words, then we get the aspects one by one
    # else, we get all aspects at once
    if n_docs <= 10:
        aspects_response, chain_llm_output_json_list, embedding_usage_info_list = _get_aspects_334(retriever, embedding_func)
    else:
        aspects_response, chain_llm_output_json_list, embedding_usage_info_list = _get_aspects_10(retriever, embedding_func)

    _print_message(f'LLM aspects content: {aspects_response}')

    # clean up
    # db.delete_collection()      # delete the collection from the db       # for per review, the collection is in-memory. for per game, the collection shd be persistent -> in both case no need to rm the collection
    del db

    return aspects_response, chain_llm_output_json_list, embedding_usage_info_list

def _process_embedding_stats(embedding_stats:list):
    usage_info_sum = {
        'prompt_tokens': 0, 'total_tokens': 0, 'completion_tokens': 0
    }

    for usage_info in embedding_stats:
        usage_info_sum['prompt_tokens'] += usage_info.prompt_tokens
        usage_info_sum['total_tokens'] += usage_info.total_tokens
        usage_info_sum['completion_tokens'] += usage_info.completion_tokens

    return usage_info_sum


def _get_aspects_334(retriever, embedding_func) -> Tuple[Dict, List, List]:
    '''Prompt the LLM to get a summary of each aspect of the game using the review text retrieved from the db as the context.
    It prompts the aspects in a (3, 3, 4) split, i.e. 3 aspects at a time, then 3 aspects, and then 4 aspects.

    Args:
        retriever: the retriever object for RAG with LangChain
        embedding_func: the embedding function used in db
    
    Returns:
        dict: a dictionary with the aspects as the key and the description of the aspect as the value
        list: a list of token usage stats for each LLM call (completion model)
        list: a list of token usage stats for each LLM call (embedding model)
    '''
    aspects_response = {k: '' for k in GAME_ASPECTS}
    token_usage_json_list = []
    embedding_usage_info_list = []

    for (start, end) in [(0, 3), (3, 6), (6, 10)]:
        aspects = GAME_ASPECTS[start:end]

        my_question = _prompts.QUESTION_TEMPLATE_01 + f"{'is ' if len(aspects) <= 1 else 'are '}" + ': ' + f'{aspects}'
        output_format = _prompts.OUTPUT_FORMAT_TEMPATE.format(
            aspects_list_01=str(aspects)[1:-1].replace('\'', '\"'), output_json_template=str({k: '...' for k in aspects}).replace('\'', '\"')
        )

        relevant_docs = retriever.get_relevant_documents(query=my_question, k=5)
        embedding_stats = embedding_func.get_embedding_stats_queue().popleft()           # get embedding token usage
        _print_message(f'Embedding stats: {embedding_stats}')
        embedding_usage_info_01 = _process_embedding_stats(embedding_stats)
        embedding_usage_info_list.append(embedding_usage_info_01)

        prompt = PromptTemplate(
            template=_prompts.KEYWORD_TEMPLATE_01,
            input_variables=["aspects", 'output_format', 'summaries'],
        )

        chain = prompt | llm_mistralai

        # retry loop if the response is not a JSON
        for i in range(5):

            _print_message(f'Attempt {i+1} for getting aspects...')

            try:
                _resp = chain.invoke({
                    "aspects": aspects,
                    "output_format": output_format,
                    "summaries": str('\n'.join([d.page_content for d in relevant_docs]))
                })
            except:
                print(traceback.format_exc())

                # put 'NA' for each aspect
                for aspect in aspects:
                    aspects_response[aspect] = 'NA'

                break       # leave the retry loop if error of MistralAI API occurs

            _print_message(f'LLM result in _get_aspects_334: {_resp}')
            token_usage_json_list.append(_resp.response_metadata['token_usage'])

            resp = _resp.content         # to get the response string


            # string processing for the response to get a JSON object

            # step 1: check if the response returns multiple JSON or a single JSON
            # by counting the number of '{' and '}' in the response

            open_brace_count = resp.count('{')
            close_brace_count = resp.count('}')

            # first condition implies there is no json in the response
            # if first condition is false -> evaluate 2nd condition 
            # it implies there shd a open brace for identifying the beginning of a possible json
            if (open_brace_count <= 0 and close_brace_count <= 0) or (open_brace_count < 1):
                _print_message(f'open_brace_count: {open_brace_count} or close_brace_count: {close_brace_count}. Retry...')
                continue

            # a single json
            if open_brace_count < 2 and close_brace_count < 2:

                # Step 2
                # manually get the JSON object by finding each aspect in the response
                # have to consider both single and double quotes
                # as mistral AI sometimes uses single quotes and sometimes double quotes
                _parsing_json_single(resp, aspects_response, aspects)


            # it returns multiple JSON
            # i.e. the model adopted a step by step output to consider each aspect, and then create a JSON for each aspect
            # resulting in multiple JSONs interlaced with other text
            # an example of such a response:
            # '''Gameplay: The game is challenging with a variety of weapons and builds to try. Bosses can be frustrating but are ultimately fun and fair. Platforming sections are less successful, but rare. ({"Gameplay": "The game is challenging with a variety of weapons and builds to try. Bosses can be frustrating but are ultimately fun and fair. Platforming sections are less successful, but rare."})\n\nNarrative: The game features a fantastic narrative that becomes more rewarding as you progress, with new secrets to discover during each playthrough. ({"Narrative": "The game features a fantastic narrative that becomes more rewarding as you progress, with new secrets to discover during each playthrough."})\n\nAccessibility: The game is not very accessible for players new to the genre, with a steep learning curve and some frustrating elements. ({"Accessibility": "The game is not very accessible for players new to the genre, with a steep learning curve and some frustrating elements."})''''
            else:
                # sanity check
                if open_brace_count != close_brace_count:
                    _print_message(f'open_brace_count: {open_brace_count} != close_brace_count: {close_brace_count}. Retry...')
                    continue

                # manually get the JSON object by finding each aspect in the response
                # have to consider both single and double quotes
                # as mistral AI sometimes uses single quotes and sometimes double quotes
                _parsing_json_multiple(resp, open_brace_count, aspects_response, aspects)

            
            # leave the retry loop if the response is a JSON
            break

    return aspects_response, token_usage_json_list, embedding_usage_info_list


def _get_aspects_10(retriever, embedding_func):
    '''Prompt the LLM to get a summary of each aspect of the game using the review text retrieved from the db as the context.
    It prompts one aspect at a time.

    Args:
        retriever: the retriever object for RAG with LangChain
        embedding_func: the embedding function used in db
    
    Returns:
        dict: a dictionary with the aspects as the key and the description of the aspect as the value
        list: a list of token usage stats for each LLM call (completion model)
        list: a list of token usage stats for each LLM call (embedding model)
    '''

    aspects_response = {k: '' for k in GAME_ASPECTS}
    token_usage_json_list = []
    embedding_usage_info_list = []

    for aspect in GAME_ASPECTS:
        my_question = _prompts.QUESTION_TEMPLATE_01 + f"is {aspect}"
        output_format = _prompts.OUTPUT_FORMAT_TEMPATE.format(
            aspects_list_01=str([aspect])[1:-1].replace('\'', '\"'), output_json_template=str({aspect: '...'}).replace('\'', '\"')
        )

        relevant_docs = retriever.get_relevant_documents(query=my_question, k=5)
        embedding_stats = embedding_func.get_embedding_stats_queue().popleft()           # get embedding token usage
        _print_message(f'Embedding stats: {embedding_stats}')
        embedding_usage_info_01 = _process_embedding_stats(embedding_stats)
        embedding_usage_info_list.append(embedding_usage_info_01)

        prompt = PromptTemplate(
            template=_prompts.KEYWORD_TEMPLATE_01,
            input_variables=["aspects", 'output_format', 'summaries'],
        )

        chain = prompt | llm_mistralai

        # retry loop if the response is not a JSON
        for i in range(5):

            _print_message(f'Attempt {i+1} for getting aspect: {aspect}...')

            try:
                _resp = chain.invoke({
                    "aspects": [aspect],
                    "output_format": output_format,
                    "summaries": str('\n'.join([d.page_content for d in relevant_docs]))
                })
            except:
                print(traceback.format_exc())

                # put 'NA' to the aspect
                aspects_response[aspect] = 'NA'

                break           # leave the retry loop if error of MistralAI API occurs

            _print_message(f'LLM result for _get_aspects_10: {_resp}')
            token_usage_json_list.append(_resp.response_metadata['token_usage'])


            resp = _resp.content         # to get the response string


            open_brace_count = resp.count('{')
            close_brace_count = resp.count('}')

            # first condition implies there is no json in the response
            # if first condition is false -> evaluate 2nd condition 
            # it implies there shd a open brace for identifying the beginning of a possible json
            if (open_brace_count <= 0 and close_brace_count <= 0) or (open_brace_count < 1):
                _print_message(f'open_brace_count: {open_brace_count} or close_brace_count: {close_brace_count}. Retry...')
                continue

            if open_brace_count < 1 or close_brace_count < 1:
                _print_message(f'open_brace_count: {open_brace_count} or close_brace_count: {close_brace_count}. Retry...')
                continue

            if open_brace_count < 2 and close_brace_count < 2:

                # string processing for the response to get a JSON object
                _parsing_json_single(resp, aspects_response, [aspect])

            # try:
            #     _ = aspects_response[aspect]      # attempting to have access to each value
            # except:
            #     print(f'Error in response_02: {aspect}. Retry...')
            #     continue
            
            # leave the retry loop if the response is a JSON
            break
    
    return aspects_response, token_usage_json_list, embedding_usage_info_list


def _get_sentiment_per_aspect_per_review(review:str, is_spam:bool, aspects_response:dict) -> Tuple[Dict, Dict]:
    '''Get the sentiment of each aspect of the game which is generated from a single review text. One of the two entrance functions for getting sentiment per aspect.

    Args:
        review (str): the review text
        is_spam (bool): True if the review is classified as a spam, False otherwise
        aspects_response (dict): a dictionary with the aspects as the key and the description of the aspect as the value
    
    Returns:
        dict: a dictionary with the aspects as the key and the sentiment of the aspect as the value
        dict: a dictionary with key as an identifier of this func, and value as a list of token usage stats for the generating sentiment response dict
    '''

    token_usage_json_list = []
    token_usage_stats = {"aspect_sentiment_tokens": token_usage_json_list}

    if is_spam:
        return None, token_usage_stats
    

    repeat_limit = 5
    aspects_resp_sentiment = {k: '' for k in GAME_ASPECTS}

    for (start, end) in ((0, 3), (3, 6), (6, 10)):
        aspects = GAME_ASPECTS[start:end]

        output_json_template = {k: '...' for k in aspects}
        output_format = "Output the JSON as a single line with no spaces between the key, value pairs. For example, if the aspects are {}, the JSON should be: {}".format(
            str(aspects)[1:-1].replace('\'', '\"'), str(output_json_template).replace('\'', '\"')
        )

        prompt = PromptTemplate(
            template=_prompts.ASPECT_SENTIMENT_TEMPLATE,
            input_variables=["aspects", "output_format", "context"]
        )

        chain = prompt | llm_mistralai

        for i in range(repeat_limit):
            _print_message(f'Attempt {i+1} for getting aspects...')

            try:
                _resp = chain.invoke({
                    "aspects": str(aspects),
                    "context": str({k: v for k, v in aspects_response.items() if k in aspects}),
                    "output_format": str(output_format)
                })
            except:
                print(traceback.format_exc())

                # put 'NA' for each aspect
                for aspect in aspects:
                    aspects_resp_sentiment[aspect] = 'NA'

                break           # leave the retry loop if error of MistralAI API occurs

            _print_message(f'LLM result in _get_sentiment_per_aspect_per_review: {_resp}')
            token_usage_json_list.append(_resp.response_metadata['token_usage'])


            resp = _resp.content         # to get the response string

            # string processing for the response to get a JSON object
            open_brace_count = resp.count('{')
            close_brace_count = resp.count('}')

            # first condition implies there is no json in the response
            # if first condition is false -> evaluate 2nd condition 
            # it implies there shd a open brace for identifying the beginning of a possible json
            if (open_brace_count <= 0 and close_brace_count <= 0) or (open_brace_count < 1):
                _print_message(f'open_brace_count: {open_brace_count} or close_brace_count: {close_brace_count}. Retry...')
                continue

            # a single json
            if open_brace_count < 2 and close_brace_count < 2:

                # Step 2
                # manually get the JSON object by finding each aspect in the response
                # have to consider both single and double quotes
                # as mistral AI sometimes uses single quotes and sometimes double quotes
                _parsing_json_single(resp, aspects_resp_sentiment, aspects)


            # it returns multiple JSON
            # i.e. the model adopted a step by step output to consider each aspect, and then create a JSON for each aspect
            # resulting in multiple JSONs interlaced with other text
            # an example of such a response:
            # '''Gameplay: The game is challenging with a variety of weapons and builds to try. Bosses can be frustrating but are ultimately fun and fair. Platforming sections are less successful, but rare. ({"Gameplay": "The game is challenging with a variety of weapons and builds to try. Bosses can be frustrating but are ultimately fun and fair. Platforming sections are less successful, but rare."})\n\nNarrative: The game features a fantastic narrative that becomes more rewarding as you progress, with new secrets to discover during each playthrough. ({"Narrative": "The game features a fantastic narrative that becomes more rewarding as you progress, with new secrets to discover during each playthrough."})\n\nAccessibility: The game is not very accessible for players new to the genre, with a steep learning curve and some frustrating elements. ({"Accessibility": "The game is not very accessible for players new to the genre, with a steep learning curve and some frustrating elements."})''''
            else:
                # sanity check
                if open_brace_count != close_brace_count:
                    print(f'open_brace_count: {open_brace_count} != close_brace_count: {close_brace_count}. Retry...')
                    continue

                # manually get the JSON object by finding each aspect in the response
                # have to consider both single and double quotes
                # as mistral AI sometimes uses single quotes and sometimes double quotes
                _parsing_json_multiple(resp, open_brace_count, aspects_resp_sentiment, aspects)

                

            # leave the retry loop if the response is a JSON
            break


    # further formatting
    # replace "positive" -> "Positive" and "negative" -> "Negative"
    for k, v in aspects_resp_sentiment.items():
        if v == 'positive':
            aspects_resp_sentiment[k] = 'Positive'
        elif v == 'negative':
            aspects_resp_sentiment[k] = 'Negative'

    return aspects_resp_sentiment, token_usage_stats


def _gen_keywords_per_review(review:str, is_spam:bool, aspects_response:dict) -> Tuple[Dict, Dict]:
    '''Generate keywords from the aspects sentences.
    
    Args:
        review (str): the review text
        is_spam (bool): True if the review is classified as a spam, False otherwise
        aspects_response (dict): a dictionary with the aspects as the key and the description of the aspect as the value

    Returns:
        dict: a dictionary with the aspects as the key and the keywords of the aspect as the value
        dict: a dictionary with the key as identifier of this func (stage) and value as a list of token usage stats for the generating keywords response dict
    '''

    # step 1: prompt LLM to determine if the review is a spam given the game name and description
    # step 2: if spam, simply return None
    # step 3: if not spam, prompt LLM to generate keywords for the review. Return a JSON

    token_usage_json_list = []
    token_usage_stats = {
        'keywords_tokens': token_usage_json_list
    }

    if is_spam:
        return None, token_usage_stats
    

    # set a number of times for repeating if the response is not a JSON
    repeat_limit = 5

    response_02_json = {}

    for i in range(repeat_limit):

        _print_message(f'Attempt {i+1} for generating keywords...')

        chat_prompt_02 = ChatPromptTemplate.from_messages([
            ("system", _prompts.SYSTEM_TEMPLATE),
            ("human", _prompts.KEYWORD_TEMPLATE_02)
        ])
        
        chain_02 = chat_prompt_02 | llm_mistralai

        try:
            _resp = chain_02.invoke({
                "aspects": GAME_ASPECTS,
                "context": str(aspects_response)
            })
        except:
            print(traceback.format_exc())
            return None, token_usage_stats     # early return if error of MistralAI API occurs

        _print_message(f'LLM result for gen_keywords_per_review: {_resp}')
        token_usage_json_list.append(_resp.response_metadata['token_usage'])

        response_02 = _resp.content         # to get the response string

        # check whether response_02 is a JSON
        # get the first '{'
        first_brace = response_02.find('{')
        if first_brace == -1:
            continue
        # and last '}'
        last_brace = response_02.rfind('}')
        if last_brace == -1:
            response_02 = response_02[first_brace:]
        else:
            response_02 = response_02[first_brace:last_brace+1]


        try:
            response_02_json = json.loads(response_02)

            break
        except:
            print(f'response_02: \'\'\'{response_02}\'\'\' is not a JSON. Resort to manual parse...')

        
        # manually get the JSON object by finding each aspect in the response
        # have to consider both single and double quotes
        # as mistral AI sometimes uses single quotes and sometimes double quotes
        
        # cannot reuse the code for _get_aspects_334 and _get_aspects_10
        # as the response is a list of keywords for each aspect, instead of a single string for each aspect
        for i, aspect in enumerate(GAME_ASPECTS):
            if ((f'\"{aspect}\"' not in response_02) and (f'\'{aspect}\'' not in response_02)):
                print(f'aspect: {aspect} not in resp_ans. Retry...')
                continue

            if i != len(GAME_ASPECTS) - 1:
                next_aspect = GAME_ASPECTS[i + 1]
                next_aspect_start = max(response_02.find(f'\"{next_aspect}\"'), response_02.find(f'\'{next_aspect}\''))
                if next_aspect_start == -1:
                    print(f'next_aspect: {next_aspect} not in resp_ans. Retry...')
                    continue
            else:
                next_aspect_start = len(response_02)


            resp_start = max(response_02.find(f'\"{aspect}\"'), response_02.find(f'\'{aspect}\'')) + len(f'\"{aspect}\"')
            value_start = response_02.find('[', resp_start + 1)
            value_end = response_02.find(']', value_start + 1)

            # find all double quotes btw value_start and value_end
            # Mistral AI uses either single or double quotes
            # instead of using eval() to convert the string to a list, we can manually extract the words and avoid missing ',' between the words
            quotes_a = [i for i, x in enumerate(response_02) if x == '\"' and value_start < i < value_end]
            quotes_b = [i for i, x in enumerate(response_02) if x == '\'' and value_start < i < value_end]
            quotes = quotes_a if quotes_a else quotes_b

            # then extract the words btw the quotes
            keywords = [response_02[quotes[i]+1:quotes[i+1]] for i in range(0, len(quotes), 2)]
            # create a list and assign it to the aspect
            response_02_json[aspect] = keywords


        return response_02_json, token_usage_stats
    

    _print_message(f'LLM result for keywords extraction: {response_02_json}')

    # further tidying
    # replace a list of 'NA' with only a list of 'NA'
    for k, v in response_02_json.items():
        if isinstance(v, list):
            if all([x == 'NA' for x in v]) or all([x == '...' for x in v]):
                response_02_json[k] = ['NA']
    
    # return None if the dict remains empty
    return (response_02_json, token_usage_stats) if response_02_json \
        else (None, token_usage_stats)

def _gen_TLDR_per_review(review:str, is_spam:bool, aspects_response:dict) -> Tuple[str, Dict]:
    '''Generate a TLDR for the review using the aspects sentences.
    
    Args:
        review (str): the review text
        is_spam (bool): True if the review is classified as a spam, False otherwise
        aspects_response (dict): a dictionary with the aspects as the key and the description of the aspect as the value
    
    Returns:
        str: the TLDR for the review
        dict: a dictionary with key as the identifier of this func and value as the list of token usage stats for the generating TLDR
    '''


    # step 1: if the number of words in the review is less than 50, return None
    # step 2: else: prompt LLM to determine if the review is a spam given the game name and description
    # step 3: if spam, simply return None
    # step 4: if not spam, prompt LLM to generate a TLDR for the review. Return a JSON

    token_usage_list = []
    token_usage_stats = {"tldr_tokens": token_usage_list}

    if is_spam:
        return None, token_usage_stats

    if len(review.split()) < 50:
        return None, token_usage_stats
    
    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.TLDR_PER_REVIEW_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm_mistralai
    _resp = chain_01.invoke({
        "context": aspects_response
    })

    _print_message(f'LLM result for generating TLDR: {_resp}')
    token_usage_list.append(_resp.response_metadata['token_usage'])

    response_01 = _resp.content         # to get the response string

    return response_01, token_usage_stats

def get_per_review_analysis(review:str) -> Tuple[bool, Dict, Dict, str, Dict]:
    '''Get the LLM assisted analysis for a review text. The main function for getting the analysis of a review text.

    Args:
        review (str): the review text
    
    Returns:
        bool: True if the review is classified as a spam, False otherwise
        dict: a dictionary with the aspects as the key and the keywords of the aspect as the value
        dict: a dictionary with the aspects as the key and the sentiment of the aspect as the value
        str: the TLDR for the review
        dict: a dictionary with the token usage stats for the generating aspect response dict, aspect keywords, aspect sentiment, and TLDR
    '''

    token_usage_stats_list = []


    
    is_spam, token_usage_stats = _check_spam(review)
    token_usage_stats_list.append(token_usage_stats)
    
    if not is_spam:
        aspects_response, token_usage_stats = _get_aspect_content_per_review(review)
    else:
        aspects_response = None
        token_usage_stats = {
            "aspect_response_tokens": [],
            "aspect_response_embedding_tokens": []
        }
    token_usage_stats_list.append(token_usage_stats)


    aspect_keywords, token_usage_stats = _gen_keywords_per_review(review, is_spam, aspects_response)
    token_usage_stats_list.append(token_usage_stats)

    # get sentiment for each aspect
    aspect_sentiment, token_usage_stats = _get_sentiment_per_aspect_per_review(review, is_spam, aspects_response)
    token_usage_stats_list.append(token_usage_stats)

    print(aspects_response)
    print('\n\n')
    print(aspect_keywords)
    print('\n\n')
    print(aspect_sentiment)
    print('\n\n')

    tldr, token_usage_stats = _gen_TLDR_per_review(review, is_spam, aspects_response)
    token_usage_stats_list.append(token_usage_stats)

    # print( is_spam, aspect_keywords, aspect_sentiment, tldr)


    # get token usage for each func
    token_usage_breakdown = _calculate_token_usage(token_usage_stats_list)

    # print(token_usage_breakdown)

    return is_spam, aspect_keywords, aspect_sentiment, tldr, token_usage_breakdown




def gen_TLDR_per_game(game_id:int) -> Tuple[str, Dict]:
    '''Generate a TLDR for a game using the critic reviews. The main function for generating a TLDR for a game.
    
    Args:
        game_id (int): the id of the game (in the platform)
    
    Returns:
        str: the TLDR for the game
        dict: a dictionary with the token usage stats for the generating TLDR
    '''



    # step 1: go to chromadb to find the collection with all critic reviews. If not found, return None
    # step 2: prompt LLm to generate a JSON with a list of keywords per aspect (or sentences from each aspect) from those critic reviews with RAG
    # step 3: ask for sentiment analysis stats
    # step 4: ask for tm stats
    # step 5: return a TLDR (str) for displaying in the "game page"

    token_usage_stats_list = []

    # check if the game supports this feature

    if game_id not in set(_pergame_tldr.TLDR_PERGAME_SUPPORTED_GAMES.keys()):
        return '', _calculate_token_usage(token_usage_stats_list)
    
    # step 0: get the gameAnalystic api result
    gameAnalystic_json = _pergame_tldr._get_gameAnalystic_result_from_api(game_id)

    if gameAnalystic_json is None:
        return '', _calculate_token_usage(token_usage_stats_list)
    
    # step 1 + step 2: get a sentence per aspect
    game_name = gameAnalystic_json['name']
    aspect_content_per_game, token_usage_stats = _get_aspect_content_per_game(game_name)
    token_usage_stats_list.append(token_usage_stats)

    if aspect_content_per_game is None:
        return '', _calculate_token_usage(token_usage_stats_list)        


    # load the reviews from folder
    # dfs = _pergame_tldr._load_sa_results_from_local(game_name, game_steamid)
    dfs = _pergame_tldr._load_sa_results_from_api_result(gameAnalystic_json)

    # step 3
    sa_stats, token_usage_stats = _get_sa_stats(dfs, llm_mistralai)
    token_usage_stats_list.append(token_usage_stats)

    # step 4: get top N topics name from BERTopic stats
    topN_topicnames = _get_tm_top_N_topic_names(dfs['topicFreq'])

    # step 5: the prompt
    tldr, token_usage_stats = _gen_TLDR_per_game(aspect_content_per_game, sa_stats, topN_topicnames)
    token_usage_stats_list.append(token_usage_stats)

    # calculate the prompt usage
    token_usage_breakdown = _calculate_token_usage(token_usage_stats_list)

    return tldr, token_usage_breakdown

# sub-functions for per game TLDR

def _get_sa_stats(dfs:dict, llm_model) -> Tuple[Dict, Dict]:
    '''Get the sentiment analysis stats for the game from the platform

    Args:
        dfs (dict): a dictionary with the dataframes for the game
        llm_model: the LLM model 

    Returns:
        dict: a dictionary with the responses for each dataframe
        dict: a dictionary with the key as the identifier of this function and value as list of token usage stats for the generating SA stats
    '''


    responses = {}
    token_usage_list = []
    token_usage_stats = {'sentiment_analysis_tokens': token_usage_list}

    assert set(_pergame_tldr.PROMPT_PER_DFS.keys()) <= set(dfs.keys()), f'{set(_pergame_tldr.PROMPT_PER_DFS.keys())} <= {set(dfs.keys())}'

    for df_key in dfs.keys() & _pergame_tldr.PROMPT_PER_DFS.keys():

        print(f'Processing {df_key}...')
        print(dfs[df_key]); print('\n\n')

        chat_prompt_01 = ChatPromptTemplate.from_messages([
            ('system', _pergame_tldr.SYSTEM_TEMPLATE),
            ('human', _pergame_tldr.PROMPT_TEMPLATE),
        ])

        chain_01 = chat_prompt_01 | llm_model

        try:

            _resp_01 = chain_01.invoke({
                'df_markdown': dfs[df_key].to_markdown(),
                'df_specific_task': _pergame_tldr.SPECIFIC_TASK_REQS_PER_DFS[df_key],
                'description_of_the_table': _pergame_tldr.PROMPT_PER_DFS[df_key],
            })

            responses[df_key] = _resp_01.content
        except:
            print(traceback.format_exc())
            responses[df_key] = 'NA'
        else:
            _print_message('LLM result in _get_sa_stats, of {}: {}'.format(df_key, _resp_01))
            
            token_usage_list.append(
                _resp_01.response_metadata['token_usage']
            )

    return responses, token_usage_stats

def _get_tm_top_N_topic_names(topicFreq_df:pd.DataFrame, top_N=5):
    '''Get the top N topic names from the BERTopic stats of the game
    
    Args:
        topicFreq_df (pd.DataFrame): the dataframe with the BERTopic stats
        top_N (int): the number of top topics to get

    Returns:
        list[str]: a list of the top N topic names
    '''

    d = topicFreq_df.sort_values(by="Count", ascending=False).head(top_N)
    # get the topic names
    topic_names = d['Topic Name'].tolist()
    return topic_names


def _gen_TLDR_per_game(aspect_content_per_game:dict, sa_stats:dict, topN_topicnames:list[str]) -> Tuple[str, Dict]:
    '''Generate the TLDR text using the aspect content, sentiment analysis stats, and topic names of the game

    Args:
        aspect_content_per_game (dict): a dictionary with the aspects as the key and the description of the aspects as the value
        sa_stats (dict): a dictionary with the responses for each dataframe
        topN_topicnames (list[str]): a list of the top N topic names
    
    Returns:
        str: the TLDR for the game
        dict: a list of dictionary with key as the identifier of this function and value as a list of token usage stats
    '''

    token_usage_list = []
    token_usage_stats = {'tldr_tokens': token_usage_list}

    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ('system', _prompts.SYSTEM_TEMPLATE),
        ('human', _pergame_tldr.TLDR_PERGAME_PROMPT_TEMPLATE),
    ])

    chain_01 = chat_prompt_01 | llm_mistralai

    try:
        _resp_01 = chain_01.invoke({
            'aspect_content': aspect_content_per_game,
            'sentiment_content': sa_stats,
            'topic_names': topN_topicnames
        })

        resp_01 = _resp_01.content
    except:
        print(traceback.format_exc())
        return None, token_usage_stats
    else:
        _print_message(f'LLM result in _gen_TLDR_per_game: {resp_01}')

        token_usage_list.append(
            _resp_01.response_metadata['token_usage']
        )
    
    return resp_01, token_usage_stats


if __name__ == "__main__":

    # change the sample to test diff reviews (per review testing)

    # temp_sample = _llm_sample_reviews.sample_03

    # print('The review is:',temp_sample)
    # print('\n\n')
    # print("length of review:", len(temp_sample.split()))

    # try:

    #     is_spam, aspect_keywords, aspect_sentiment, tldr, token_usage_breakdown = get_per_review_analysis(temp_sample)

    # except Exception as e:
    #     print('Error:', e)
    #     print(traceback.format_exc())

    # print('Is spam:', is_spam)
    # print('Aspect keywords:', aspect_keywords)
    # print('Aspect sentiment:', aspect_sentiment)
    # print('TLDR:', tldr)
    # print('\n')
    # print('Token usage breakdown:', token_usage_breakdown)
    # print('\n\n')
    # print('-'*20 + 'END' + '-'*20)




    # per game TLDR testing

    game_name = 'Starfield'

    pergame_tldr, token_usage_breakdown = gen_TLDR_per_game(game_name)

    print('Game:', game_name)
    print('TLDR:', pergame_tldr)
    print('\n')
    print('Token usage breakdown:', token_usage_breakdown)
    print('\n\n')
    print('-'*20 + 'END' + '-'*20)

