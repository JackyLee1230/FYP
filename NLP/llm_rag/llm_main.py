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
from _llm_rag_utils import _print_message, _parsing_json_single, _parsing_json_multiple, RagType, GAME_NAMES_TO_DB_NAME
import _pergame_tldr

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
    timeout=120,
    # callbacks=[MyCustomHandler(), MyCustomHandler2()],
    # verbose=True
)

# use RootListenersTracer to get the token usage for ChatMistralAI
# https://github.com/langchain-ai/langchain/issues/16379
from langchain_core.tracers.root_listeners import RootListenersTracer
from langchain_core.runnables.config import RunnableConfig

# global variable to store the latest token usage
latest_llm_output_json = None

# Define your callbacks
def on_start(run):
    # print(f"Start: {run}")
    pass

def on_end(run):
    # print(f"End: {run}")
    global latest_llm_output_json

    str_run = str(run)
    idx = str_run.find('llm_output')

    if idx == -1:
        print(f"on_end callback llm_output not found in the run: {str_run}")
        return

    # get first '{ and first '}' after idx
    first_brace = str_run.find('{', idx)
    second_brace = str_run.find('{', first_brace)
    second_closing_brace = str_run.find('}', second_brace+1)
    first_closing_brace = str_run.find('}', second_closing_brace+1)

    _print_message(f"on_end callback llm_output: {str_run[first_brace:first_closing_brace+1]}")

    try:
        llm_output_json = json.loads(str_run[first_brace:first_closing_brace+1].replace('\'', '\"'))
        _print_message(f"Token usage: {llm_output_json['token_usage']}")

        latest_llm_output_json = llm_output_json
    except:
        print(f"Error in parsing JSON: {str_run[first_brace:first_closing_brace+1]}")
        traceback.print_exc()

        latest_llm_output_json = None


def on_error(run):
    # print(f"Error: {run}")
    pass

# shared config to retrieve toke usage of a chain
chain_config = {"callbacks": [
    RootListenersTracer(
        config=RunnableConfig(),
        on_start=on_start,
        on_end=on_end,
        on_error=on_error
    )]
}



chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def _check_spam(review:str):

    # store token usage for the two LLM call
    chat_01_llm_output_json = None
    chat_02_llm_output_json = None

    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm_mistralai

    # wrap with try-except block, as exception may be raised (e.g. mistralai.exceptions.MistralAPIStatusException: Status: 500. Message: {"object":"error","message":"Service unavailable.","type":"internal_server_error","param":null,"code":"1000"})
    try:
        response_01 = chain_01.invoke({
            "review": review,
        }, config=chain_config)
    except:
        print(traceback.format_exc())
        return True, [chat_01_llm_output_json, chat_02_llm_output_json]         # default return true (i.e. isSpam)
    else:
        _print_message(f'LLM result for spam check: {response_01}')
        chat_01_llm_output_json = latest_llm_output_json

    chat_prompt_02 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01),
        ("ai", response_01.content),            # .content to get the response, same as below
        ("human", _prompts.SPAM_TEMPLATE_02)
    ])

    chain_02 = chat_prompt_02 | llm_mistralai

    try:
        response_02 = chain_02.invoke({
            "review": review
        }, config=chain_config)
    except:
        print(traceback.format_exc())
        return True, [chat_01_llm_output_json, chat_02_llm_output_json]     # default return true (i.e. isSpam)
    else:
        _print_message(f'LLM result_2 for spam check: {response_02}')
        chat_02_llm_output_json = latest_llm_output_json

    response_02 = response_02.content         # to get the response string


    # formulate the llm_output_json
    llm_output_json = [chat_01_llm_output_json, chat_02_llm_output_json]

    if "YES" in response_02 or "Yes" in response_02 or "yes" in response_02:
        return True, llm_output_json
    else:
        return False, llm_output_json
    

def _create_review_obj(review:str):
    '''Create a review object with the review text and a hash of the review text as the key
    for creating a temporary in-menory db for one-time RAG
    '''
    review_obj = {
        "review_text": review,
        "datetime": datetime.now()
    }

    hash = sha224(str(review).encode()).hexdigest()
    review_obj['hash'] = hash

    return review_obj


def _get_aspect_content_per_review(review:str):

    _review_obj = _create_review_obj(review)

    _rag_request = {
        "type": RagType.PER_REVIEW,
        "payload" : _review_obj
    }

    db, retriever, embedding_func, embedding_usage_info_01 = _get_rag_documents(_rag_request)

    # sanity check onlt, the PER_REVIEW enum is defined and a db will always be returned
    if db is None:
        return None, None, ({}, [])
    
    aspects_response, chain_llm_output_json_list, embedding_usage_info_list = _get_aspects_content(db, retriever, embedding_func)

    return aspects_response, chain_llm_output_json_list, (embedding_usage_info_01, embedding_usage_info_list)


def _get_aspect_content_per_game(game_name:str):

    # sanity check
    if game_name not in set(GAME_NAMES_TO_DB_NAME.values()):
        return None, None, ({}, [])

    _rag_request = {
        "type": RagType.PER_GAME,
        "payload": {
            "game_name": game_name,
            # "db_name": GAME_NAMES_TO_DB_NAME[game_name]
            "db_name": game_name
        }
    }

    db, retriever, embedding_func, embedding_usage_info_01 = _get_rag_documents(_rag_request)

    # sanity check only, the PER_GAME enum is defined and a db will always be returned
    if db is None:
        return None, None, ({}, [])
    
    aspects_response, chain_llm_output_json_list, embedding_usage_info_list = _get_aspects_content(db, retriever, embedding_func)

    return aspects_response, chain_llm_output_json_list, (embedding_usage_info_01, embedding_usage_info_list)


def _get_rag_documents(_rag_request:dict):

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
            

    
def _get_aspects_content(db, retriever, embedding_func):
    # create a temporary db for one-time RAG

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


def _get_aspects_334(retriever, embedding_func):
    aspects_response = {k: '' for k in GAME_ASPECTS}
    chain_llm_output_json_list = []
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
                }, config=chain_config)
            except:
                print(traceback.format_exc())

                # put 'NA' for each aspect
                for aspect in aspects:
                    aspects_response[aspect] = 'NA'

                break       # leave the retry loop if error of MistralAI API occurs

            _print_message(f'LLM result in _get_aspects_334: {_resp}')
            chain_llm_output_json_list.append(latest_llm_output_json)

            resp = _resp.content         # to get the response string


            # string processing for the response to get a JSON object

            # step 1: check if the response returns multiple JSON or a single JSON
            # by counting the number of '{' and '}' in the response

            open_brace_count = resp.count('{')
            close_brace_count = resp.count('}')

            # a single json
            if open_brace_count < 2 and close_brace_count < 2:

                # Step 2
                # manually get the JSON object by finding each aspect in the response
                # have to consider both single and double quotes
                # as mistral AI sometimes uses single quotes and sometimes double quotes
                _parsing_json_single(resp, aspects_response, aspects)

                # try:
                #     for aspect in aspects:
                #         _ = aspects_response[aspect]      # attempting to have access to each value
                # except:
                #     print(f'Error in response_02: {aspect}. Retry...')
                #     continue


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
                

                # try:
                #     for aspect in aspects:
                #         _ = aspects_response[aspect]      # attempting to have access to each value
                # except:
                #     print(f'Error in response_02: {aspect}. Retry...')
                #     continue
            
            # leave the retry loop if the response is a JSON
            break

    return aspects_response, chain_llm_output_json_list, embedding_usage_info_list


def _get_aspects_10(retriever, embedding_func):
    aspects_response = {k: '' for k in GAME_ASPECTS}
    chain_llm_output_json_list = []
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
                }, config=chain_config)
            except:
                print(traceback.format_exc())

                # put 'NA' to the aspect
                aspects_response[aspect] = 'NA'

                break           # leave the retry loop if error of MistralAI API occurs

            _print_message(f'LLM result for _get_aspects_10: {_resp}')
            chain_llm_output_json_list.append(latest_llm_output_json)


            resp = _resp.content         # to get the response string


            open_brace_count = resp.count('{')
            close_brace_count = resp.count('}')

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
    
    return aspects_response, chain_llm_output_json_list, embedding_usage_info_list


def _get_sentiment_per_aspect_per_review(review:str, is_spam:bool, aspects_response:dict):

    chain_llm_output_json_list = []

    if is_spam:
        return None, chain_llm_output_json_list
    

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
                }, config=chain_config)
            except:
                print(traceback.format_exc())

                # put 'NA' for each aspect
                for aspect in aspects:
                    aspects_resp_sentiment[aspect] = 'NA'

                break           # leave the retry loop if error of MistralAI API occurs

            _print_message(f'LLM result in _get_sentiment_per_aspect_per_review: {_resp}')
            chain_llm_output_json_list.append(latest_llm_output_json)

            resp = _resp.content         # to get the response string

            # string processing for the response to get a JSON object
            open_brace_count = resp.count('{')
            close_brace_count = resp.count('}')

            # a single json
            if open_brace_count < 2 and close_brace_count < 2:

                # Step 2
                # manually get the JSON object by finding each aspect in the response
                # have to consider both single and double quotes
                # as mistral AI sometimes uses single quotes and sometimes double quotes
                _parsing_json_single(resp, aspects_resp_sentiment, aspects)

                try:
                    for aspect in aspects:
                        _ = aspects_resp_sentiment[aspect]      # attempting to have access to each value
                except:
                    print(f'Error in accessing: {aspect}. Retry...')
                    continue


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

                try:
                    for aspect in aspects:
                        _ = aspects_resp_sentiment[aspect]      # attempting to have access to each value
                except:
                    print(f'Error in accessing: {aspect}. Retry...')
                    continue
                

            # leave the retry loop if the response is a JSON
            break


    # further formatting
    # replace "positive" -> "Positive" and "negative" -> "Negative"
    for k, v in aspects_resp_sentiment.items():
        if v == 'positive':
            aspects_resp_sentiment[k] = 'Positive'
        elif v == 'negative':
            aspects_resp_sentiment[k] = 'Negative'

    return aspects_resp_sentiment, chain_llm_output_json_list


def _gen_keywords_per_review(review:str, is_spam:bool, aspects_response:dict):
    # step 1: prompt LLM to determine if the review is a spam given the game name and description
    # step 2: if spam, simply return None
    # step 3: if not spam, prompt LLM to generate keywords for the review. Return a JSON

    chain_llm_output_json_list = []

    if is_spam:
        return None, chain_llm_output_json_list
    

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
            }, config=chain_config)
        except:
            print(traceback.format_exc())
            return None, chain_llm_output_json_list     # early return if error of MistralAI API occurs

        _print_message(f'LLM result for gen_keywords_per_review: {_resp}')
        chain_llm_output_json_list.append(latest_llm_output_json)

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


        return response_02_json, chain_llm_output_json_list
    

    _print_message(f'LLM result for keywords extraction: {response_02_json}')

    # further tidying
    # replace a list of 'NA' with only a list of 'NA'
    for k, v in response_02_json.items():
        if isinstance(v, list):
            if all([x == 'NA' for x in v]) or all([x == '...' for x in v]):
                response_02_json[k] = ['NA']
    
    # return None if the dict remains empty
    return (response_02_json, chain_llm_output_json_list) if response_02_json \
        else (None, chain_llm_output_json_list)

def _gen_TLDR_per_review(review:str, is_spam:bool, aspects_response:dict):
    # step 1: if the number of words in the review is less than 50, return None
    # step 2: else: prompt LLM to determine if the review is a spam given the game name and description
    # step 3: if spam, simply return None
    # step 4: if not spam, prompt LLM to generate a TLDR for the review. Return a JSON

    chain_llm_output_json = {}

    if is_spam:
        return None, chain_llm_output_json

    if len(review.split()) < 50:
        return None, chain_llm_output_json
    
    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.TLDR_PER_REVIEW_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm_mistralai
    _resp = chain_01.invoke({
        "context": aspects_response
    }, config=chain_config)

    _print_message(f'LLM result for generating TLDR: {_resp}')
    chain_llm_output_json = latest_llm_output_json

    response_01 = _resp.content         # to get the response string

    return response_01, chain_llm_output_json

def get_per_review_analysis(review:str) -> tuple[bool, dict, str]:
    '''Get the LLM assisted analysis for a review
    
    :param review: the review to be analyzed

    return a tuple of three elements:
    - a boolean, whether the review is a spam
    - a dictionary, the keywords for each aspect
    - a string, the TLDR for the review
    '''

    spam_llm_output_json = []
    aspects_response_llm_output_json_list = []
    aspects_response_embedding_usage_info = ({}, [])
    aspect_sentiment_llm_output_json_list = []
    keywords_llm_output_json_list = []
    tldr_llm_output_json = {}
    
    is_spam, spam_llm_output_json = _check_spam(review)
    
    if not is_spam:
        aspects_response, aspects_response_llm_output_json_list, aspects_response_embedding_usage_info = _get_aspect_content_per_review(review)
    else:
        aspects_response = None

    aspect_keywords, keywords_llm_output_json_list = _gen_keywords_per_review(review, is_spam, aspects_response)

    # get sentiment for each aspect
    aspect_sentiment, aspect_sentiment_llm_output_json_list = _get_sentiment_per_aspect_per_review(review, is_spam, aspects_response)

    print(aspects_response)
    print('\n\n')
    print(aspect_keywords)
    print('\n\n')
    print(aspect_sentiment)
    print('\n\n')

    tldr, tldr_llm_output_json = _gen_TLDR_per_review(review, is_spam, aspects_response)

    # print( is_spam, aspect_keywords, aspect_sentiment, tldr)


    # get token usage for each func
    token_usage_breakdown = _calculate_token_usage(
        spam_llm_output_json, aspects_response_llm_output_json_list, aspects_response_embedding_usage_info,
        aspect_sentiment_llm_output_json_list, keywords_llm_output_json_list, tldr_llm_output_json
    )

    # print(token_usage_breakdown)

    return is_spam, aspect_keywords, aspect_sentiment, tldr, token_usage_breakdown


# TODO: move to _llm_rag_utils.py
def _calculate_token_usage(spam_llm_output_json:list, aspects_response_llm_output_json_list:list, aspects_response_embedding_usage_info:tuple[dict, list[dict]], 
                           aspect_sentiment_llm_output_json_list:list, keywords_llm_output_json_list:list, tldr_llm_output_json:dict):
    _sum_total_token = 0

    _sum_spam_token = 0
    _sum_aspect_resp_token = 0
    _sum_aspect_resp_embedding_token = 0
    _sum_aspect_sentiment_token = 0
    _sum_keywords_token = 0
    _sum_tldr_token = 0

    # calculate spam detection token
    for spam_llm_output in spam_llm_output_json:
        _token_usage = spam_llm_output.get('token_usage', {})
        _total_tokens = _token_usage.get('total_tokens', 0)
        _sum_spam_token += _total_tokens

    # calculate aspect response token
    for aspects_response_llm_output in aspects_response_llm_output_json_list:
        _token_usage = aspects_response_llm_output.get('token_usage', {})
        _total_tokens = _token_usage.get('total_tokens', 0)
        _sum_aspect_resp_token += _total_tokens

    # calculate aspect response embedding token
    _embedding_usage_info_01, _embedding_usage_info_list = aspects_response_embedding_usage_info
    _sum_aspect_resp_embedding_token += _embedding_usage_info_01.get('total_tokens', 0)     # the embedding token required to build the in-memory vector db
    for _embedding_usage_info in _embedding_usage_info_list:
        _total_tokens = _embedding_usage_info.get('total_tokens', 0)
        _sum_aspect_resp_embedding_token += _total_tokens

    # calculate aspect sentiment token
    for aspect_sentiment_llm_output in aspect_sentiment_llm_output_json_list:
        _token_usage = aspect_sentiment_llm_output.get('token_usage', {})
        _total_tokens = _token_usage.get('total_tokens', 0)
        _sum_aspect_sentiment_token += _total_tokens

    # calculate keywords token
    for keywords_llm_output in keywords_llm_output_json_list:
        _token_usage = keywords_llm_output.get('token_usage', {})
        _total_tokens = _token_usage.get('total_tokens', 0)
        _sum_keywords_token += _total_tokens

    # calculate tldr token
    _token_usage = tldr_llm_output_json.get('token_usage', {})
    _total_tokens = _token_usage.get('total_tokens', 0)
    _sum_tldr_token += _total_tokens

    _sum_total_token = _sum_spam_token + \
        _sum_aspect_resp_token + _sum_aspect_resp_embedding_token + \
        _sum_aspect_sentiment_token + _sum_keywords_token + _sum_tldr_token

    token_usage_breakdown = {
        "total_tokens": _sum_total_token,
        "spam_tokens": _sum_spam_token,
        "aspect_response_tokens": _sum_aspect_resp_token,
        "aspect_response_embedding_tokens": _sum_aspect_resp_embedding_token,
        "aspect_sentiment_tokens": _sum_aspect_sentiment_token,
        "keywords_tokens": _sum_keywords_token,
        "tldr_tokens": _sum_tldr_token
    }

    return token_usage_breakdown


def gen_TLDR_per_game(game_name:str, game_steamid:int):
    # step 1: go to chromadb to find the collection with all critic reviews. If not found, return None
    # step 2: prompt LLm to generate a JSON with a list of keywords per aspect (or sentences from each aspect) from those critic reviews with RAG
    # step 3: ask for sentiment analysis stats
    # step 4: ask for tm stats
    # step 5: return a TLDR (str) for displaying in the "game page"

    aspect_content_per_game, aspects_response_llm_output_json_list, aspects_response_embedding_usage_info = _get_aspect_content_per_game(game_name)

    # skip step 2 to try try first

    # load the reviews from folder
    # TODO: replace that with the API call
    dfs = _pergame_tldr._load_sa_results_from_local(game_name, game_steamid)

    # step 3
    sa_stats, sa_llm_output_json_list = _get_sa_stats(dfs, llm_mistralai)

    # step 4: get top N topics name from BERTopic stats
    topN_topicnames = _get_tm_top_N_topic_names(dfs['topicFreq'])

    # step 5: the prompt
    tldr, tldr_llm_output_json = _gen_TLDR_per_game(aspect_content_per_game, sa_stats, topN_topicnames)

    # calculate the prompt usage
    token_usage_breakdown = _calculate_tldr_per_game_token_usage(
        aspects_response_llm_output_json_list, aspects_response_embedding_usage_info, sa_llm_output_json_list, tldr_llm_output_json
    )

    return tldr, token_usage_breakdown


def _calculate_tldr_per_game_token_usage(
        aspects_response_llm_output_json_list:list, aspects_response_embedding_usage_info:tuple[dict, list[dict]],
        sa_llm_output_json_list:list[dict], tldr_llm_output_json:dict):
    
    _sum_total_token = 0
    _sum_aspect_resp_token = 0
    _sum_aspect_resp_embedding_token = 0
    _sum_sa_token = 0
    _sum_tldr_token = 0

    # calculate aspect response token
    for aspects_response_llm_output in aspects_response_llm_output_json_list:
        _token_usage = aspects_response_llm_output.get('token_usage', {})
        _total_tokens = _token_usage.get('total_tokens', 0)
        _sum_aspect_resp_token += _total_tokens

    # calculate aspect response embedding token
    _embedding_usage_info_01, _embedding_usage_info_list = aspects_response_embedding_usage_info
    _sum_aspect_resp_embedding_token += _embedding_usage_info_01.get('total_tokens', 0)     # the embedding token required to build the in-memory vector db
    for _embedding_usage_info in _embedding_usage_info_list:
        _total_tokens = _embedding_usage_info.get('total_tokens', 0)
        _sum_aspect_resp_embedding_token += _total_tokens

    # calculate sentiment analysis token
    for sa_llm_output in sa_llm_output_json_list:
        _token_usage = sa_llm_output.get('token_usage', {})
        _total_tokens = _token_usage.get('total_tokens', 0)
        _sum_sa_token += _total_tokens
    
    # calculate tldr token
    _token_usage = tldr_llm_output_json.get('token_usage', {})
    _total_tokens = _token_usage.get('total_tokens', 0)
    _sum_tldr_token += _total_tokens

    _sum_total_token = _sum_aspect_resp_token + _sum_aspect_resp_embedding_token + _sum_sa_token + _sum_tldr_token

    token_usage_breakdown = {
        "total_tokens": _sum_total_token,
        "aspect_response_tokens": _sum_aspect_resp_token,
        "aspect_response_embedding_tokens": _sum_aspect_resp_embedding_token,
        "sentiment_analysis_tokens": _sum_sa_token,
        "tldr_tokens": _sum_tldr_token
    }

    return token_usage_breakdown


# main functions

def _get_sa_stats(dfs:dict, llm_model):
    responses = {}
    llm_output_json_list = []

    assert set(_pergame_tldr.PROMPT_PER_DFS.keys()) <= set(dfs.keys()), f'{set(_pergame_tldr.PROMPT_PER_DFS.keys())} <= {set(dfs.keys())}'

    for df_key in dfs.keys() & _pergame_tldr.PROMPT_PER_DFS.keys():
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
            }, config=chain_config)

            responses[df_key] = _resp_01.content
        except:
            print(traceback.format_exc())
            responses[df_key] = 'NA'
        else:
            llm_output_json_list.append(latest_llm_output_json)
            _print_message('LLM result in _get_sa_stats, of {}: {}'.format(df_key, _resp_01))

    return responses, llm_output_json_list

def _get_tm_top_N_topic_names(topicFreq_df:pd.DataFrame, top_N=5):
    d = topicFreq_df.sort_values(by="Count", ascending=False).head(top_N)
    # get the topic names
    topic_names = d['Topic Name'].tolist()
    return topic_names


def _gen_TLDR_per_game(aspect_content_per_game:dict, sa_stats:dict, topN_topicnames:list[str]):
    chain_01_llm_output_json = None

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
        }, config=chain_config)

        resp_01 = _resp_01.content
    except:
        print(traceback.format_exc())
        return None, chain_01_llm_output_json
    else:
        chain_01_llm_output_json = latest_llm_output_json
        _print_message(f'LLM result in _gen_TLDR_per_game: {resp_01}')
    
    return resp_01, chain_01_llm_output_json


if __name__ == "__main__":
    # testing 

    # most repr reviews from bertopic
    sample_01 = "poorly optimized, runs between 25 - 35 fps on both low and ultra settings. you ' d think that if ultra was 30 - 35 then low should be 60, but no. even with max settings game still looked odd after disabling up - scaling. a $ 70 title should run at 50 - 60 fps on the lowest settings minimum. and trying to optimize the settings to get better frames i have dumped to many hours into it to get a refund. so here i will sit and wait till they fix the performance."
    sample_02 = "good game, todd"
    sample_03 = "okay this game is getting some bad reviews. however i do not think this game is bad. i ' ll agree that you need a pretty good pc to run it. but the game itself isn ' t bad. yes there are some bugs, i have not come across many but i have experienced a few. the story isn ' t great either but the latest assassins creed games did not have very good stories, so people can ' t blame this game alone. after you ' ve played for an hour or so and you ' ve learned how the game plays, you can start exploring paris, which is really cool. paris is huge and you have a lot of things you can do. coop missions, random events and a ton of other cool stuff, are some of the things you can keep yourself busy with. the customization in this game is great. you can choose between many different clothings. you can also buy color so you can make the character dress like a rainbow. there are a lot of different weapons in this game, from swords to axes even rifels. obisoft also made a great decision putting stealth into the game. now you can sneak around without being seen. the graphics in this game are really good. standing on a high point and"
    sample_04 = "glados, oh, glados. you bring so much fun into a game. while there are some people who might not like portal, i ' m one of the many who love it. i don ' t think there is much i can say about the game that many do not already know. it ' s a very intriguing puzzle / ' shooter ' that was pretty freaking original when it came out. it can be a little confusing if you ' re not able to wrap your head around the puzzles, but most people shouldn ' t have many issues. i ' ve played the game many times over ( not all on steam ) and have enjoyed it every single time. many years from now, it ' ll be still yeah, i know."
    sample_05 = "was good, until the social club app stopped working. i followed some steps on the offical rockstar website about how to fix this problem and now gta 5 is permanently broken. either the social club app crashes on startup or the program made to patch and fix this problem says ' grand theft auto 5 isnt installed on your if anybody can help me please respond but until then. rip gta 5 it was fun while it lasted."
    sample_06 = "make this for mac!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    sample_07 = "the first rpg ive ever played. hated rpgs before this, and only picked this up on a steam sale, that too, reluctantly. however, gave it a try, and got so engaged in the story right from the start, only because of the narrator ' s voice. the music ' s reall good as well. one of the best for a game. i feel the developers, supergiant games, did a better job with bastion ' s music than that of transistor ' s. the handpainted graphics felt so unique to me as well. haven ' t seen something like this in other games before this. i ' d give it a 10 / 10 rating for story, music, weapons / upgrades, visuals."
    sample_08 = "although the game is old, and the combat is weird, its very fun. after 5 hours of game play, im satisfied with the $ 1 i spent. if you plan on buying the witcher 3, buy this game, and witcher 2 when they are on sale, so you have an understanding of the story. witcher 3 will make alot more sense if you do."
    sample_09 = "we were ready to clean up all of the trash on our streets once and for all. the first cat was tough to kill, since we had no idea what we would be up against. we lost jerry and milton in the process, but we all knew what was on the line in order to exterminate all of the cats. after the 10th cat, we didn ' t even pay attention to the ones that had died because we had become used to it. after 20, it seemed that some were just killing the cats for sport. the 30th cat was a bit stronger. it had wiped out over half of our entire army, but crazy steve strapped on his vest and let himself get swallowed, where he detonated the cat and saved many of our lives that day. i will never forget the sacrifice he made. it was a rough day. cat 39 had killed all but 8 of us. there was only one left. the next day, i saw him. he had a scar. it was him. it was the one who had killed my parents. i had trained my whole life for this moment. i had done everything i could to get the revenge i wanted. it was my moment. the first rat had blown himself up, along with the second rat."
    sample_10 = "uncensored boobs on a steam game 11 / 10"
    sample_11 = "overall good magic card game. the only issue i can really see is the random algorithem for shuffeling the deck, more times than not you either hit a major mana pocket or no mana at all for half the deck reguardless of deck size. i would also suggest to the devs to allow specific card buying for coins as its really hard to get a single card from an entire set of cards, and yes i would expect the cost to be much higher than for booster packs, adjusted for card value and rareity."
    sample_12 = "please update!!! this game could be so amazing!!!! achievements too!!!!"


    # they're most repr reviews from LDA
    sample_w_01 = "'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!'"
    sample_w_02 = "lyrics: give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money"
    sample_w_03 = "Hours, and hours, and hours, and hours, and hours, and hours back in the day, and still these days every now and then."
    sample_w_04 = "SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT"
    sample_w_05 = "Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack   Fun game would reccomend"
    sample_w_06 = "Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies   That is all."
    sample_w_07 = "Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates.  Do NOT buy this game, or any game made by this developer."
    sample_w_08 = "*click click click click click click click click click click click click click* YOU WIN"
    sample_w_09 = "Even for this price its bad.  2 many bugs, bad collision detection and, on higher difficulty settings, enemies that can hear a mosquito fart..."
    sample_w_10 = "This was a very frustrating experience for me. The controls and mechanics were not explained properly and I wasn't able to complete even the basic missions. I gave up very soon."
    sample_w_11 = "This is the most immersive MMO on the market. It takes features from the previous Elder Scrolls games with MMO mechanics and seamlessly combine them to form a smooth gameplay experience. If you love TES you'll find a home here."
    sample_w_12 = "The bosses are WAY too hard. I died 30 times on a boss, rage quit."


    # https://steamcommunity.com/profiles/76561198085425935/recommended/1245620/
    long_review_01 = \
'''I'm only writing this review because Shadow of the Erdtree was finally announced and I want to go on the record for anyone who never got around to playing it yet for whatever reason. If you heard about the DLC and are thinking "yeah, maybe now is the time I'll finally dive in", then this is directed at you.

Elden Ring is not for everyone. If you don't respect the grind, then it will kick the ♥♥♥♥ out of you without remorse. There is no easy mode, no save-scumming, no cheat codes, and absolutely no hand holding. Yeah sure.. you can rely on Youtubers and Wiki pages to tell you what some of the ULTIMATE BUILDS might be... but even if you're relying on a crutch like that, you STILL have to put the work in and "git gud" when it's all said and done. It also takes a while to even get access to all the weapons/gear that those guides expect you to be using, not to mention earning the experience needed for the build to be viable. So my suggestion to you is to worry less about building an exact carbon copy of a character that some other person already played as, and just try to take it all in and experience it for yourself first.

I got every achievement, defeated every boss, and it was the most rewarding grind I've ever embarked upon in a game. I made a lot of mistakes along the way, but I learned from every single one of them. I got my ass kicked every time I booted up the game, but every triumph I celebrated was unlike any other thanks to all of those ass-kickings. From the hardest boss fights to the most annoying mobs, you truly feel every single victory... and that's where I got hooked because the sense of accomplishment you get from progressing in Elden Ring... I'm telling you, it is the ultimate dopamine shot.

Now, I personally loved the story, but it's definitely a subjective experience. Elden Ring is a mythological story about gods and demi-gods, and if you take the time to read through the item descriptions, look closer at the game world, and try to fill in the gaps kind of like a detective would, then you will probably enjoy it too. If you are expecting the cutscenes to be the only thing you have to pay attention to in order to know what's going on, you might be disappointed.

Without a quest menu or anything like that to keep track of things, the game forces you to do your own due diligence and keep track of the NPCs you've spoken to, and to really listen to what they say because completing side quests isn't like most open world games that just plop a waypoint down for you to walk to after you've skipped all the dialogue. You need to listen and think about it, and if you've already progressed through certain points of the main-story, then you might not even get to experience some of the side quests. This aspect of Elden Ring can be a bit frustrating because you really aren't given any indication if you've missed a part of a quest or if you missed a quest entirely until it's too late. I will just say that if you're bee-lining it straight to the main bosses, you are definitely missing a LOT of what makes the game so good (and you're also missing out on side quests that lead to valuable ITEMS and EXPERIENCE!!!). So if you don't want to miss anything, my advice is to take it all very slow, and just try to clear regions and talk to everyone you see before moving on to new areas. If you think you missed stuff, keep in mind that you can always try again in NG+.

Multiplayer is completely optional, but opting in to allow invasions can be rewarding because testing your build against actual players is pretty fun, plus you get to also see what other people are doing with their characters. Sometimes seeing someone else in action can inspire you to try new stuff, or it can make you aware of a flaw in your own character. I will say that I personally played with the player messages turned off though because I didn't want to read possible spoilers, and I felt reading messages left by other players all over the place broke my immersion.. but to each their own.

If you've never played Elden Ring before and are finally considering a run through the game for the first time... I truly envy you because I would do anything to wipe my memory and play it again for the first time. It is a game like no other, and it will test you in more ways than one. Just don't get discouraged when you hit a wall.. because we've ALL been there... all you have to do is learn to overcome it. Once you do, I promise there is no greater feeling in all of gaming.'''

    # https://steamcommunity.com/id/sexphynx/recommended/1245620/
    long_review_02 = \
'''Being my first souls game, I was convinced I would be wasting my money, and that the first boss I encountered would kick my ass. And I was proven right in no time, by the Grafted Scion. “But you were expected to be defeated by that one!”, you say. Worry not, the Tree Sentinel was also quick to put me back in my place once I had built the tiniest bit of confidence after beating the tutorial boss.

The game is fantastic. It got more and more rewarding as I progressed, and I was happy to beat the game a second and a third time, finding out new secrets during each playthrough. There’s no compliment I can come up with that hasn’t already been used to describe this game.

There are so many weapons with so many different builds to try. Bosses can be frustrating but there’s so much fun to be had. Even what is considered to be one of the toughest fights (looking at you, Malenia) is incredibly fair and fun. And the spectral horse you get is most likely the best horse I’ve ever ridden in any game, ever.

If I had anything to complain about, are the platforming sections. But after looking it up a bit, apparently FromSoftware never really knew how to do those, and they are so few and far between, that's hardly a reason not to buy the game.

I could also complain that I was unable to romance Boggart or Blaidd. They’re so cool.

10/10, the DLC cannot come a day too soon.'''

    # https://steamcommunity.com/profiles/76561198125518593/recommended/1245620/
    long_review_03 = \
'''Since the release of Skyrim on 11/11/11 I have been craving an open world experience with rewarding combat, build theories, crazy-beautiful aesthetics, and a real sense of accomplishment (items, dungeons completed, etc).

This game delivers the entire experience in a way I've never quite seen. I'm new to the souls-like genre, and FROMSOFTWARE games. Here are the takeaways for me:

1. Combat is extremely rewarding by being unforgiving. At first glance, it's hard, but as you delve just a little deeper you realize that combat in this game is an art form that takes practice, and then more practice. The satisfaction is higher than any game I've played in the last decade. The light attacks, heavy attacks, blocks, parrying, sprint attacks, sneak attacks, all play a little different and allow you to really pick your method or avenue of approach.
2. Items in game (from armor and weapons, to craftables and ashes) are each, individually, potentially game changing or build changing and can really flesh out a 'build'. It's rewarding to find items in game as any one of them could be the weapon of choice for your desired build.
3. Open world is absolutely stunning and feels very scary, yet very exciting. Every new enemy seen needs to be studied, practiced, and learned for optimal combat. New enemies can be scary as you don't immediately know their capabilities. Boss fights are hard (some more than others) and many enemies are the type that require you to come back at a later time when you have stronger tools, or more HP, or you git gud. Roaming new areas is thrilling and you begin to truly have to balance and manage your HP, FP, and Stamina while in combat. The lighting in caves with torches or lanterns is immersive and you feel the danger.
4. Character building is straightforward. You level up as you beat enemies and use the runes (XP, currency) as you see fit to either purchase things, or level up....etc and you can decide what attribute to increase. Trying new weapons, new armors, is both fun and interesting.

The need to knows:
1. Game won't hold your hand. You are in a labyrinth with many things that all can kill you. You will not know exactly what you're doing, where you're going, or why you are existing.
2. Everything you see can kill you if you become too careless. Slow and steady usually is the best method. Slow is smooth and smooth is fast.
3. Ashes of War, summoning and crafting must be experimented with to understand. Again, no hand holding.
4. You will ask yourself, "How in the world am I supposed to ever be able to complete this?" Many, many times.
5. Puzzles and secrets abound, exploration and a good memory are key.
6. While there is a multiplayer experience (PVP and PVE) it's a bit confusing and from what I've experienced so far, not necessarily mandatory. The single player experience is strong with this one.

I've spent 42 hours in this game as of writing this and I've barely left the starting area - Limgrave. My nightmares consist of Runebears, traversing the mist, and boss fights. I've been startled, pillaged, rekt, and absolutely confused many times, but I wouldn't change any of it. I remember the first time I saw a giant I had Attack on Titan flashbacks and began trying to summon my inner Captain Levi. It's just a blast. An absolute blast. The greatest feeling of accomplishment is when you start to beat bosses or new enemies on your first attempt. You can feel your ability, your reaction time, your muscle-memory coming more and more into play as you practice, and it creates a thrilling experience. Struggling with an enemy type for hours only to come back a few days later and realize how much stronger and faster you've gotten is a very rewarding experience.'''

    # https://steamcommunity.com/id/apasserby/recommended/1817190/
    long_review_04 = \
    '''Pros
+ Carries over the great traversal and combat mechanics from the first game
+ You can now perform wall and ceiling takedowns
+ Great port; runs smooth for the most part
+ You can get a Spider-Cat travel companion
+ More air tricks variations
+ Great soundtrack
+ Great accessibility options: action shortcuts, disabling button mashing QTEs etc

Cons
- Too short to be worth the price; has only around 1/3 the content of the first game
- Cutscenes are unskippable, even in NG+; only a select few cinematics can be skipped
- Not as many fun variations to take down enemies due to fewer and less interesting gadgets
- Finishing move mechanics were better in the first game
- Several bugs and visual glitches, with some being carried over from the first game
- The story villain is barely a footnote in the story
- No DLC

Neutral
- Story is too generic, even by stereotypical comic book standards
- Miles is significantly squishier than Peter; may be enjoyable for those looking for a challenge
- Camouflage and Venom attacks overcompensate and can be quite overpowered
- I find Miles's sQuEAky voice mildly annoying, but perhaps it's fitting for a 17 year old teenager.

Worth the play, but wait for a sale
~16 hours for 100% completion, and ~21 hours for 100% achievements is just too short for this game to be worth a buy at full price. You also get fewer gadgets and they feel rather uninspired. While I enjoyed using all 8 gadgets in the first game, I found myself mainly using only 2 in this one.

And while this game is inferior to the first in almost every way, 2018's Spider-Man set such a ridiculously high standard that simply sharing the same core gameplay still makes this game great. So if you enjoyed the first game, this is definitely worth the play, but definitely only get it at at least 25% off unless you're impatient like me.'''


    # https://steamcommunity.com/id/KnyH/recommended/1817190/6
    long_review_05 = \
'''Spider-Man: Miles Morales is definitely a great superhero game and it does a lot to improve on its predecessor in terms of combat and traversal. It never really gets old to web-sling through an accurate depiction of New-York City. The story and game play was enjoyable enough for me to at least want a game play session in everyday. The story had like able characters and not one really stood out to me as a bad character. Graphics are amazing and as expected.

However, the game did miss two marks for me. One big gripe I had with the game was the overall playtime. If we disregard side missions and the open-world activities, we are looking at 6-7 hours of main mission playtime. It also does not help that the first game doubles this playtime. It only took me around 22 hours to complete the game 100%. Another issue I could not look over was the lack of memorable boss fights, its hard not to compare it to the first game but, the first game did have many good boss fights against Spider-Man's iconic villains. This game did not even reach to half of that. Although, the final boss was a banger.

Overall, it is pretty difficult to justify paying full price for this game, but I can say that it is game that should not be looked over, especially if you were a fan of the first game. If you want to wait for a sale, that's cool, if you want to buy asap I'd say that's cool too.'''


    test = \
'''After 11 years, Counter-Strike: Global Offensive has been, somewhat unceremoniously, shut down in favour of the newer, shinier Counter-Strike: 2. Whether you like it or not, Valve wants you playing CS2. For those who don\'t take their CS all too seriously, CS2 won\'t seem like much of a change from CS:GO, besides some grenade changes, more detailed maps, and a disappointing lack of fan favourite game modes. And for those who train their aim on the reg and line up their smoke grenades, CS2 might look the part but lacks the precision of CS:GO\'s movement and gunplay.\\n\\nStill, CS2 captures what makes Counter-Strike tick and even if the foundation seems a little sparse and a touch shaky right now, I\'m confident Valve have an FPS that\'ll supersede CS:GO in time.\\n\\nFor your average Counter-Strike-enjoyer, CS2 will seem more like a large CS:GO patch than a sequel eleven years in the making. Sure CS2 is powered by Valve\'s newer Source 2 engine, with a slew of smaller tweaks to menus and bigger tweaks to the way grenades work. Ultimately, though, it\'s still terrorists versus counter terrorists where budgets wax and wane depending on how many heads players have dinked in their crosshairs. Hop into a game of CS2 and it\'ll feel very, very similar to CS:GO. It\'s to be expected right? CS2 was always going to elevate a winning formula and not like, introduce wall running and a perk system.\\n\\nTransitioning from CS:GO to CS2 is easy peasy, as all of your settings and binds port over, alongside all your cosmetics. As a returning player, I had no problem hopping into CS2 and finding my feet quickly, which deserves a big thumbs up. Unfortunately for newcomers, the game\'s still poor at guiding you towards useful things, like tweaking your aim sensitivity or adjusting your crosshair or even what any of the modes actually entail. Guides or an experienced mate are likely necessities if you\'re feeling a bit overwhelmed, so CS still has some growing to do on the tutorial front.\\n\\nI\'d say your mileage may vary if you\'re playing Casual matches, as they\'re still a chaotic mass of bodies and grenades that offset the intricacies of bomb defusal, but hop into Deathmatch, Competitive or the new Premier mode and CS2 captures what makes Counter-Strike so damn crispy. As much as guns have personality and it\'s satisfying when you land your shots, CS is about question and answer, both in response to your teammates\' dots as they scurry about the map, as well as the sudden cracks of gunfire that break long periods of silence. Are you covering your allies\' blind spot? Is it time to rush B no stop? Yes and absolutely 1000%, yes.\\n\\nAnd if we examine the small changes more closely, they do play a more significant role in making match admin a bit easier. The flexibility of the new inventory means you\'re able to curate your weapons pool with a drag and drop, so you can finally have both CT assault rifles available in the buy menu if you\'d like (I am giddy). And the buy menu\'s been updated, so as your teammates purchase guns in-between rounds, little dots underneath each weapon\'s portrait help you see everyone\'s loadout at a glance. There\'s even a handy refund button to undo those slip-ups or ease last minute hits to the bank account.\\n\\nA web where players pick and ban maps in the Premier mode of CS2.\\nThere\'s a new Premier game mode that\'s distinct from Competitive in a way that\'s not explained by any tooltips anywhere. Essentially, Competitive is the equivalent of ranked matches where you get to choose the maps you\'d like to play before you queue up. Premier has a whole map pick and ban phase, as well as a global/regional ranking with a points system dependent on how good you are.\\nIt\'s on the surface where the game\'s most obvious change lies. Step into any map and it\'ll appear brighter and more colourful, with dark corners abolished in favour of visibility. Step into Mirage\'s palace and there\'s a proper sheen to the marble floor, the monster graffiti in Overpass now wraps around the tunnel with a mighty splash, and I\'d spend my Steam Points on a long weekend at Inferno\'s apartments because they\'re gorgeous now (noise might be an issue, but we compromise). Gone are the days of walls with the texture of hummus and I\'m here for it.\\n\\nOn the slightly-less-obvious-until-you-sling-one-across-a-map scale, grenades are more reactive to their surroundings. In CS:GO, smoke grenades would generate a puff of static fog that wouldn\'t budge until it disappeared. But in CS2, fog will curve around an arch and spill outwards, or wedge itself into a narrow gap and shoot upwards like it\'s been pinched by the stone. What\'s neat is how explosions from regular grenades will dissipate smoke for a second, exposing any poor bastards hiding away inside. And if you shoot through the edges of a cloud, it\'ll bobble around your bullets and potentially expose enemies, too.\\n\\nGenerally, I think the smoke grenade tweaks affect both your regular and serious players equally, as they\'re substantial enough to alter their most basic usage as quickly chucked sight blockers or entirely change how top players use them. I\'m by no means a serious player and even I\'ve found the new smokes awaken options that hadn\'t previously existed. Rather than waiting around tentatively for them to vanish or being surprised when someone erupts from the darkness, it finally feels like you\'re able to manipulate smokes inline with the rest of CS\'s sandbox.\\n\\nOverall match length has been reduced from a race to 16, to 13. Or in other terms, the maximum number of rounds has been reduced from 30 to 24 overall per match. I\'ve not found it an issue, and if anything, makes each and every round feel a little more meaningful.\\nDespite some of these positive strides in maps and grenades, there\'s also a lot of goodness from CS:GO that hasn\'t found its way into CS2\'s launch. There\'s no Mac support. No Arms Race or War Games. No way in the console to go left-handed. Fan favourite maps like Cache and Train are absent. All of these will undoubtedly come with time, but it\'s frustrating that we can\'t go back to CS:GO and enjoy them because Valve snapped it out of existence. I don\'t blame players for thinking CS2 has \\"cut the game in half\\", as it sort of seems that way.\\n\\nThere\'s also an argument to be made about how some of the maps like Inferno and Italy have been \\"overhauled\\" and what overhauled means for most people. For folks like me, most of the changes are about as perceptible as spotting a lobster with pink eye. Most of these tweaks involve shifting a ledge a few inches to the right, which serves the side of the community for whom minutiae matter. Again an example of how CS2\'s updates will seem more substantial to some and barely present for others.\\n\\nA player in Counter-Strike 2 inspects their knife in front of a wall with colourful graffiti on it.\\n\\nHaving tuned into pro-players and their streams, it seems like there\'s a lot of talk about CS2 feeling off compared to CS:GO. Movement isn\'t quite as smooth and spraying with your weapon doesn\'t feel as accurate. The new servers with their 64 tick/sub-tick thing just doesn\'t cut it, apparently (I have zero idea what sub-tick means). For long-time fans and serious CS-heads, it seems like CS2 has some catching up to do. And as a sort of lapsed player who used to take it quite seriously but doesn\'t anymore, I agree that the sensation of accuracy in holding down the trigger feels a bit\\u2026 off in CS2? I\'ve also been sniped around a corner a few times, which didn\'t happen in CS:GO, and might be something to do with those server ticks? But hey, I\'m finding my matches of CS2 just as thrilling as before! And I\'m sure most players will, too.\\n\\nIt wouldn\'t be CS - or any videogame, I suppose - without rounding off a game and being hit by cosmetic rewards and the like. If you bought CS:GO back in the day, you\'ll get what\'s called \\"Prime Status\\" free of charge in CS2, otherwise it will cost you \xc2\xa315. Those with Prime Status unlock the competitive and premier modes, plus queues with other Prime members. In theory, it\'s Valve\'s way of saying that you\'re more likely to play against people who don\'t take their FPS video games for granted. Eh, I\'ve still been matched up with both lovely people and horrible folks I\'ve reported almost instantly, so I doubt it makes much of a difference. Either way, what Prime also enables is the Weekly Care Package, so if you earn enough EXP and level up, you\'ll get to choose two cosmetic rewards to add to your collection. Cool, I guess.\\n\\nValve\'s still at it with loot crates you\'ve got to pay to open and the dodgy marketplaces that orbit it. But I wouldn\'t say it\'s super in your face, as you can choose to not engage with it if you\'d like. I basically do not care for any skins or crates or anything and the game doesn\'t hit me with pop-ups or punish me for tuning out. I\'m not saying I like the whole gambling thing and I wish it didn\'t exist, but you\'re at least free to disengage.\\n\\nEven so, if I\'m being perfectly honest, I think my CS days are behind me. It\'s an FPS that requires a lot from you, and those after a shooter you can sort of switch your mind off to should look elsewhere. But if you\'re a newcomer, lapsed player, or veteran, I think CS2 offers up thrilling matches that can twist and turn after a smart play or a remarkable shot. Many will find it\'s rather close to CS:GO with neat upgrades to grenades and extra pop to maps, while another portion of the community might just want CS:GO back. Right now CS2 is a great iterative update to a tried and true formula... that\'s missing an awful lot of fan favourite stuff. Give it time, though, and I think it\'s onto something pretty special.
'''

    test_2 = \
'''this game is pretty trash. the beginning was horrible and honestly made no sense, a space game with very little cool space stuff, and I mean that seriously. Its just wild to me how out of touch Bethesda has become'''
    
    test_3 = \
'''An incredible game that i discovered thanks to my friend and aswell as ark mods believe it or not. I recommend this to be played by people that are ACCEPTING to be defeated from time to time and that dont have as much frustration over losing. Game itself is peak overall. While i do prefer multiplayer WAY more than solo you can for sure solo this game quite fast actually. hours in this game are like minutes. extremely fun game i recommend it! Monster designs are beyond perfect.'''

    critic_review_01 = \
'''Cyberpunk 2077
Review by John Tucker, January 3, 2021

Over the last few weeks, one question has run through my head many, many times: how do I actually review Cyberpunk 2077? It was one of the most highly-anticipated releases of the year, and although people were frustrated when its release got delayed more than once, I think they understood that COVID was causing trouble for everyone and hopeful that a delay would mean a very polished game. But then the release approached and news came out that, despite earlier promises that developers wouldn’t be required to deal with “crunch time,” they had to deal with it for more than a year.

When it finally released, the console versions were so buggy as to be unplayable, and both digital and physical retailers expanded their refund policies to accommodate anyone who wanted to return the game. Here at RPGFan, one reviewer was unable to finish even the game’s prologue on PC before the game crashed permanently. With the copy I personally purchased on PC, I had better luck and was able to play all the way to the end credits with only minor glitches.

So, do I factor those elements into my score because they’re a part of the game’s ecosystem, or do I leave them out unless they impact my particular experience? In the end, I hope to walk the tightrope and find a balance between the two.

In Cyberpunk 2077, you play a character known only as V who takes a page from the Dragon Age: Origins book and starts in one of three places of your choice. After a short prologue, all three stories converge in the same area, but you have dialogue options related to your specific backstory throughout the game. The main story deals with a question at the heart of the cyberpunk genre: what does it mean to be human? It’s a difficult question, and I don’t know that this game attempts to give a definitive answer so much as it tells one person’s struggle to decide what it means to them and what they feel is justifiable in the pursuit of holding onto their humanity and defining a legacy for themselves.

I’m told that the main story could be completed in only 20 hours or so, but those missions are just the tip of the iceberg in terms of what this game has to offer. I played the final story mission at about the 70 hour mark so that I could write a review, but there may still be that amount of content again for me to play. There are a lot of side quests to go on with characters like Keanu’s, and you don’t want to miss that, because it’s great stuff. It’s worth pointing out a number of these characters are middle-aged or older women, which is pretty unusual and cool. The nature of tech in the Cyberpunk universe means they don’t look as old as their birthdate says they are, but they’re not 20 and they don’t act like they are.


The world map is jam packed with side gigs from taking out some very bad people by any means necessary to sneaky heists where getting caught means failure. Some are silly. Others will stick with you long after you’re done, wondering if you made the right choice not as a character in a game that will likely be unaffected by that side mission, but as the player who made the choice. What this game offers in that respect is truly outstanding.

Assuming you can play the game at all, its gameplay really shines. When given the option, I tend to play games as a sneaky sniper type, popping my head out to zap an enemy without being noticed, and this game definitely allowed for that just as well as it allowed for those who like to break down the front door and start tossing grenades. In one infiltration mission, I stopped and counted at least six possible ways I could have gotten to my target, and at that point, I didn’t even have the leg enhancements that gave me a fifteen foot vertical leap. There were only two points in the game where I was trapped in a small space with no real cover and no choice but to fight, and although it took a couple of tries, I was able to get through them without wanting to throw my controller. 

There are multiple types of guns on offer from pistols to shotguns, but also guns that ricochet and guns that use smart targeting to home in on enemies. There are also a plethora of silent melee options, from katanas to hammers to… a large flesh-colored club you won’t want your mom to see you wielding. But you don’t have to do everything with your hands — in this world, everybody’s got a variety of hardware built into their body somewhere, and you can use yours to hack theirs. You start with simple options, but by the end of the game, if you’ve bought the upgrades, you’ll be locking your enemies in place, blinding them, and non-lethally zapping them into unconsciousness two at a time all while getting critical headshots with your pistol. For me, normal difficulty was just enough to make me feel great when I did cool things while still presenting plenty of evidence that I was not unstoppable.

I used a PS4 controller on my PC, and the controls were mostly great when it counted. I had no trouble running, hacking, and shooting, and when I drove a vehicle, my R2 “gas pedal” allowed me to choose my speed. As I got my hands on a few vehicles, I noticed how differently they handled, which I appreciate. I started the game as a Nomad, and I oversteered horribly when driving V’s original car, but the more Buick-like car I got later was easy to handle, and I loved weaving motorcycles through traffic. Sadly, I had to use a wire for my PS4 controller — I have the game via GoG Galaxy, which only appears to support wireless play for Xbox controllers — but I was playing on a laptop, so the wire wasn’t a real obstacle.


The controls aren’t perfect, though. I tried driving with a keyboard at one point, and the binary nature of those controls didn’t work for me at all. In contrast, I always felt like the menu screens were clearly designed with a mouse in mind, as they present you with a sort of mouse cursor and the d-pad often doesn’t move around as you might hope. Still, the controls are good enough and flexible enough that keyboard or controller fans are all likely to find something they can work with.

Cyberpunk 2077‘s presentation is top-notch as well, with excellent graphics, music, and voice acting on display from start to finish… mostly. Although the game only crashed on me once, this is the area where I ran into glitches. There were occasional NPCs clipping through objects or each other, but that didn’t happen frequently or bother me much. More frustratingly, though, I ran into quite a number of occasions where interactable objects stopped being highlighted in the game world, or when I pushed the button to hack them. A few times, one bar of music from an action scene kept looping after the scene was over until I restarted the game. None of this was an every few minutes kind of issue — more like every couple of hours.

As long as things aren’t glitchy, it’s extremely interesting to walk and drive around Night City seeing everything that’s on display. The various sectors of the city have their similarities, but they are mostly distinct, from the types of buildings and roads to the people walking around. Head to the edges of town and you can find the mansions of the elite or the nasty, nasty garbage dump and oil field. The business district is shiny and clean, without the vending machines present all over the residential areas. I finished the game’s story yesterday, but I’ll definitely be back to find more of what I haven’t seen yet.

Despite my praise for Cyberpunk 2077‘s overall aesthetic, I would be wrong not to point out a flaw that shows up repeatedly. One of the often-seen in-game billboards features a transphobic joke, and there are several other design elements that would be generously described as unfriendly to transgender people. When these issues were pointed out to developer CD Projekt RED, their response was to double down by mocking those same people. You might think “OK, that’s not a good call, but why does this specific game matter in that fight?” But it’s important to know that transhumanism — the idea that a human body as it is when one is born is only a starting point, and that technology can (and should) be used to change that body as needed — is a crucial element of the cyberpunk genre. This game should have been the AAA title that was the most friendly to the transgender community rather than a bad example. Bringing up these bad choices in the design and PR isn’t political correctness: it’s calling out the game for failing to correctly reflect its setting, like it would be if a medieval simulation game included a character with a gun.

With all of this in mind, Cyberpunk 2077 ends up being one of those games that can be frustrating to love. There are good design elements all over, from a menu option disabling licensed music for streaming to quests that completely change based on whether you choose to go in guns blazing or stay hidden and make sense both ways. The main and side quests are all packed full of great story, the characters are fun to get to know… and yet despite all of the effort that went into this game, we also see the bad design choices I discussed above and an unplayable console version. If you can take the places where it’s a bad example and remember to do better in your own life, and maybe wait until it’s been patched into working, there’s an amazing game here that you can be glad you experienced.

Pros
Great story, gameplay, and characters. Hanging out with Keanu is a joy.

Cons
Unplayably glitchy on a console and on some PCs, bad choices in transgender design that are relevant to the genre.

Bottom Line
Cyberpunk 2077 is a heck of a game, if you can manage to play it.

Graphics
85
Sound
90
Gameplay
90
Control
80
Story
95
Overall Score
70
'''

    # https://steamcommunity.com/profiles/76561198845032034/recommended/1817190/
    middle_review_01 =  \
'''Alright, so after completing all achievements I feel like this game has some decent replayablilty. But I do have my share of complaints and praises about this game.

1. This game is too short. I mean for almost the same price as Marvel's Spiderman, I finished all objectives in well around 26 hrs as compared to the 100+ hrs it took me for Spiderman.
2. There needs to be some varieties of enemies and bosses. I feel like I only remember Prowler, Rhino and Tinkerer fights, but then again the first point kinda covers it.
3. The venom and cloaking are awesomely done in this game, loved those abilities.
4. Costumes are downright sick, better than the Spiderman ones' imo.
5. Ran really well on Steam Deck (finished it on deck).

If this game had the same or almost similar amount of gameplay content as Spiderman, this would have been my favorite spiderman game yet.

Iac, this game is worth playing, maybe get it on sale coz original price ain't worth it.'''

    # https://steamcommunity.com/id/chrono2jam/recommended/1817190/
    middle_review_02 = \
'''The game is good but imo, it's not as good as the first one. It way shorter and lack of content compared to the first one, it feels like bigger than normal DLC but way too small for a standalone game. It also has less gadget, but there few mechanic's to make it up. On top of that, I encountered couple of annoying crashes when doing some challenges.

That said, the story is (un)surprisingly good and new mechanic's are amazing, I still miss some of the old skills and gadgets tho. However, this price point is way too expensive for the content it offer, especially if you compare with the first one.

Be patience and wait for the sale.'''


    # change the sample to test diff reviews (per review testing)

    temp_sample = critic_review_01

    print('The review is:',temp_sample)
    print('\n\n')
    print("length of review:", len(temp_sample.split()))

    try:

        is_spam, aspect_keywords, aspect_sentiment, tldr, token_usage_breakdown = get_per_review_analysis(temp_sample)

    except Exception as e:
        print('Error:', e)
        print(traceback.format_exc())

    print('Is spam:', is_spam)
    print('Aspect keywords:', aspect_keywords)
    print('Aspect sentiment:', aspect_sentiment)
    print('TLDR:', tldr)
    print('\n')
    print('Token usage breakdown:', token_usage_breakdown)
    print('\n\n')
    print('-'*20 + 'END' + '-'*20)




    # per game TLDR testing
    # game_name = 'starfield'
    # game_steamid = 1716740

    # pergame_tldr, token_usage_breakdown = gen_TLDR_per_game(game_name, game_steamid)

    # print('Game:', game_name)
    # print('TLDR:', pergame_tldr)
    # print('\n')
    # print('Token usage breakdown:', token_usage_breakdown)
    # print('\n\n')
    # print('-'*20 + 'END' + '-'*20)

