import json
import traceback
import numpy as np
import requests
import torch
from sentence_transformers import SentenceTransformer
from bertopic import BERTopic


from datetime import datetime
from pathlib import Path
import time
import os
import sys

import str_cleaning_functions

import threading
from concurrent.futures import ThreadPoolExecutor
import functools
import pika
from pika import PlainCredentials

sys.path.append('llm_rag')
from llm_main import get_per_review_analysis

from read_game_specific_topic_name_json import SPECIFIC_TOPIC_NAME_GAMES, SPECIFIC_TOPIC_NAME_DICT, MODEL_SPECIFIC_TOPIC_NAME_DICT
from _load_bertopic_models import _load_bertopic_model, GENRES, BERTOPIC_MODELS
from _utils import GENRES_DB, GENRES_DB_TO_GENRE_BERTOPIC


def cleaning(s_list: list[str]):
    s_list = list(map(lambda x: str_cleaning_functions.remove_links(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.remove_links2(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.clean(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.deEmojify(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.unify_whitespaces(x), s_list))

    return s_list


# def _load_bertopic_model(model_path:Path):
#     # load bertopic model
#     topic_model = BERTopic.load(str(model_path))

#     return topic_model

def _create_embedding_model(model_name:str):
    # load the sbert model
    model = SentenceTransformer(model_name, device=device)      # the only params at training is the model name

    return model


def inference(s_list: list[str]):
    '''Inference to classify the topic of the list of strings
    return a list of integers, each integer represents the id of the topic of the corresponding string in the input list
    integers should be either from [-1, 0, ..., number of topics - 1] (total len of possible topics = number of topics + 1, -1 is the outlier topic)

    :param s_list: list of strings to be classified

    return a list of integers, which contain the topic id of the corresponding string in the input list
    '''
    # clean the input list
    s_list = cleaning(s_list)

    # create embeddings

    embeddings = sbert_model.encode(s_list)

    # topics: a np.array with shape (n_docs,)
    # probs: a np.array with shape (n_docs, n_topics), where n_topics = 40
    topics, probs = topic_model.transform(s_list, embeddings=embeddings)

    return topics, probs
    # return topics


# -------------------
# RabbitMQ connection
# -------------------

# reference: https://cloud.tencent.com/developer/article/1838485 (example 5)

# for threading
local = threading.local()


def init_connection():
    # Establish connection
    credentials = PlainCredentials('FYP', 'FYP')
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='137.184.216.126', port=5672, credentials=credentials, heartbeat=0))

    channel = connection.channel()

    return channel, connection

# setup is based on https://github.com/pika/pika/blob/main/examples/basic_consumer_threaded.py


def ack_message(channel, delivery_tag):
    """Note that `channel` must be the same pika channel instance via which
    the message being ACKed was retrieved (AMQP protocol constraint).
    """
    if channel.is_open:
        channel.basic_ack(delivery_tag)
    else:
        # Channel is already closed, so we can't ACK this message;
        # log and/or do something that makes sense for your app in this case.
        pass


def consumer(ch, method, properties, body, inference_obj):

    global model_folder_path, topic_model

    reviewId, comment, game_genres, game_name = inference_obj

    try:
        # first based on the game genre to find the model
        game_genres_enum = [GENRES_DB[game_genre] for game_genre in game_genres]

        # check game name and genre
        if game_name in SPECIFIC_TOPIC_NAME_GAMES and GENRES_DB.ACTION_AND_ADVENTURE in game_genres_enum:

            # load the model
            
            model_folder_path, topic_model = _load_bertopic_model(
                GENRES_DB_TO_GENRE_BERTOPIC[GENRES_DB.ACTION_AND_ADVENTURE], 10)

            print((game_name, GENRES_DB_TO_GENRE_BERTOPIC[GENRES_DB.ACTION_AND_ADVENTURE], 10))

            # get the topic name json
            topic_id_to_label_json = SPECIFIC_TOPIC_NAME_DICT.get(
                (game_name, GENRES_DB_TO_GENRE_BERTOPIC[GENRES_DB.ACTION_AND_ADVENTURE], 10), None)
        else:
            # indie games
            model_folder_path, topic_model = _load_bertopic_model(
                GENRES_DB_TO_GENRE_BERTOPIC[GENRES_DB.INDIE], 30)
            
            topic_id_to_label_json = MODEL_SPECIFIC_TOPIC_NAME_DICT.get(
                (GENRES_DB_TO_GENRE_BERTOPIC[GENRES_DB.INDIE], 30), None)

        start_time = time.time()
        
        topics, probs = inference([comment])       # wrap the comment as a list

        print('BERTopic Inference result:', topics, probs)
    except Exception as e:
        print("Error during BERTopic inference:", e)
        print(traceback.format_exc())
        return
    

    # LLM results
    try:
        is_spam, aspect_keywords, tldr = get_per_review_analysis(comment)
        print('LLM Inference result:', is_spam, aspect_keywords, tldr)

        llm_result = {
            "isSpam": is_spam,
        }

        if not is_spam:
            llm_result.update(aspect_keywords)
            llm_result.update({
                "summary": tldr
            })

    except:
        print("Error during LLM inference:", e)
        print(traceback.format_exc())
        return
    
    end_time = time.time()
    print('Time taken for bertopic & llm:', end_time-start_time)

    print(topic_id_to_label_json)

    # use a BlockingConnection per-thread
    # reuse created BlockingConnection if the thread in the threadpool has created one
    if not hasattr(local, 'channel'):
        thread_channel, _ = init_connection()
        thread_id = threading.currentThread().ident
        print(f'Thread {thread_id} created channel.')
        local.channel = thread_channel
        local.channel.confirm_delivery()

    # forming the result
    try:
        resultToBeSentBack = json.dumps({
            'reviewId': reviewId,
            'BERT':{
                topics[0].item():  [
                    topic_id_to_label_json[f"{topics[0].item()}"] if topic_id_to_label_json else "<Unknown>",       # a default value if the json file is not found
                    f"{probs[0][topics[0] + 1].item()}"
                ]
            },
            'LLM':llm_result
        })
    except Exception as e:
        print("Error forming the result:", e)
        print(traceback.format_exc())
        return

    now = datetime.now()
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")

    print(
        f'Result \"{resultToBeSentBack}\" sent by thread {threading.currentThread().ident} At Time {date_time}')
    try:
        # enable the test queue for debugging
        local.channel.basic_publish(
            exchange='FYP_exchange', routing_key='FYP_TestQueue', body=f'Result \"{resultToBeSentBack}\" sent by thread {threading.currentThread().ident}', mandatory=True)

        # the production queue
        # use the local thread channel to send back the result (to maintain thread-safe queue)
        local.channel.basic_publish(
            exchange='FYP_exchange', routing_key='FYP_TopicModelingResult', body=resultToBeSentBack, mandatory=True)

    except pika.exceptions.UnroutableError as e:
        print("UnroutableError" + str(reviewId) + ";" + e)
    # test queue to not destroying the main queue

    # notify the RabbitQueue
    # acknowledge finish processing the msg to the channel in the main thread
    cb = functools.partial(ack_message, ch, method.delivery_tag)
    ch.connection.add_callback_threadsafe(cb)


def callback(ch, method, properties, body):
    # Process the received message
    print("Received message:", body)

    try:
        _body = json.loads(body)

        reviewId = int(_body['reviewId'])
        comment = _body['reviewComment']
        game_genres = _body['genre']
        game_name = _body['name']

    except json.JSONDecodeError as e:
        print("Error decoding the message:", e)
        print(traceback.format_exc())
        return
    except ValueError as e:
        print("Error parsing the reviewId or gameid:", e)
        print(traceback.format_exc())
        return

    # use thread pool executor to limit the number of threads spawned
    threadpoolexecutor.submit(
        consumer, ch, method, properties, body, (reviewId, comment, game_genres, game_name)
    )


def listen_to_queue():

    # Establish connection
    channel, connection = init_connection()

    # Declare the queue
    channel.queue_declare(queue='TopicModelingQueue', durable=True)

    channel.basic_qos(prefetch_count=5)

    # Start consuming messages
    on_message_callback = functools.partial(callback)
    channel.basic_consume(queue='TopicModelingQueue',
                          on_message_callback=on_message_callback)

    try:
        # Keep the program running
        channel.start_consuming()
    except KeyboardInterrupt:
        # shutdown the threadpoolexecutor
        # set cancel_futures to True as those un-run submissions cannot be fetched back to the backend
        # once the connection is closed.
        # posed data loss threat
        threadpoolexecutor.shutdown(wait=True, cancel_futures=True)

        # Close the connection upon interrupt signal (e.g., Ctrl+C)
        channel.stop_consuming()
        connection.close()



if __name__ == "__main__":
    
    # GLOBAL SETTINGS
    os.environ['TOKENIZERS_PARALLELISM'] = 'false'          # disable huggingface warning
    device = torch.device('cpu')                            # use CPU


    # training_datetime = datetime(2024, 3, 1, 9, 51, 49)
    # training_folder = Path(
    #     "../NLP/tm",            # for the program to locate the parent folder of this project
    #     f'bertopic[split]_genre_action_grid_search_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
    # model_folder_path = training_folder.joinpath('bertopic_bt_nr_topics_10')
    # print('Loaded model from:', model_folder_path)

    # load the BERTopic model
    # topic_model = _load_bertopic_model(model_folder_path)

    # model_folder_path, topic_model = _load_bertopic_model(
    #     GENRES.ACTION, 10)      # load the action genre model with 10 topics

    model_folder_path, topic_model = BERTOPIC_MODELS[(GENRES.ACTION, 10)]

    # load the sbert model
    sbert_model_name = 'all-MiniLM-L6-v2'
    sbert_model = _create_embedding_model(sbert_model_name)


    # test inference with BERTopic
    # topics, probs = inference(['I like this game'])
    # print(topics, probs)
    # topics, probs = inference(['I love this game', 'I hate this game', 'I like this game', 'I dislike this game'])
    # print(topics, probs)


    # create a threadpoolexecutor for multi-thread
    n_threads = 5
    threadpoolexecutor = ThreadPoolExecutor(max_workers=n_threads)

    listen_to_queue()