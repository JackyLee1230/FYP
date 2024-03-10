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

import str_cleaning_functions

import threading
from concurrent.futures import ThreadPoolExecutor
import functools
import pika
from pika import PlainCredentials

from read_game_specific_topic_name_json import read_game_specific_topic_name_json

IP = "https://critiqbackend.itzjacky.info"
PORT = 9000


def cleaning(s_list: list[str]):
    s_list = list(map(lambda x: str_cleaning_functions.remove_links(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.remove_links2(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.clean(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.deEmojify(x), s_list))
    s_list = list(map(lambda x: str_cleaning_functions.unify_whitespaces(x), s_list))

    return s_list


def _load_bertopic_model(model_path:Path):
    # load bertopic model
    topic_model = BERTopic.load(str(model_path))

    return topic_model

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

    reviewId, gameid, comment = inference_obj

    start_time = time.time()
    result, _ = inference([comment])       # wrap the comment as a list

    # also have to get the name of the game from the gameid
    # temporarily hardcode the ip and port
    req_url = f"{IP}:{PORT}/api/game/findGameById"
    payload = json.dumps({
        "id": 1,
        "includeReviews": False,
        "includePlatformReviews": False
        })
    headers = {
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", req_url, headers=headers, data=payload)
        print(response.json())
        game_name = response.json()['name']

        # then read the json file that contains the topic names for the specific game and topic name
        topic_id_to_label_json = read_game_specific_topic_name_json(game_name, model_folder_path)
        
    except Exception as e:
        print("Error getting the game name:", e)
        print(traceback.format_exc())
        return

    end_time = time.time()
    print('Time taken:', end_time-start_time)

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
            'gameId': gameid,
            'topicId': result[0].item(),
            "topicName": topic_id_to_label_json[f"{result[0].item()}"] if topic_id_to_label_json else "<Unknown>"       # a default value if the json file is not found
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
            exchange='FYP_exchange', routing_key='FYP_TestQueue', body=f'Result \"{str(reviewId) + ";" + str(result[0])}\" sent by thread {threading.currentThread().ident}', mandatory=True)

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

        gameid = int(_body['gameId'])
        reviewId = int(_body['reviewId'])
        comment = _body['reviewComment']
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
        consumer, ch, method, properties, body, (reviewId, gameid, comment)
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
    

    training_datetime = datetime(2024, 3, 1, 9, 51, 49)
    training_folder = Path(
        "../NLP/tm",            # for the program to locate the parent folder of this project
        f'bertopic[split]_genre_action_grid_search_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
    model_folder_path = training_folder.joinpath('bertopic_bt_nr_topics_10')
    print('Loaded model from:', model_folder_path)

    # load the sbert model
    sbert_model_name = 'all-MiniLM-L6-v2'
    sbert_model = _create_embedding_model(sbert_model_name)

    # load the BERTopic model
    topic_model = _load_bertopic_model(model_folder_path)

    # test inference with BERTopic
    # topics, probs = inference(['I like this game'])
    # print(topics, probs)
    # topics, probs = inference(['I love this game', 'I hate this game', 'I like this game', 'I dislike this game'])
    # print(topics, probs)


    # create a threadpoolexecutor for multi-thread
    n_threads = 5
    threadpoolexecutor = ThreadPoolExecutor(max_workers=n_threads)

    listen_to_queue()