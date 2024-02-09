import numpy as np
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
    '''Inference to classify the sentiment of the list of strings
    return a list of integers, each integer represents the sentiment of the corresponding string in the input list
    integers should be either 1 or -1, where 1 = positive, -1 = negative

    :param s_list: list of strings to be classified

    return a list of integers, which contain the sentiment of the corresponding string in the input list
    '''
    # TODO: rewrite inference functions for bertopic

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

    reviewId, comment = inference_obj

    start_time = time.time()
    result, _ = inference([comment])       # wrap the comment as a list
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
    resultToBeSentBack = bytes(str(reviewId) + ";" + str(result[0]), 'utf-8')

    now = datetime.now()
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")

    print(
        f'Result \"{str(reviewId) + ";" + str(result[0])}\" sent by thread {threading.currentThread().ident} At Time {date_time}')
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
    # TODO: propose a JSON-like formating for msg
    # find the first occurance of ; and split it intwo two parts
    reviewId = str(body)[0: str(body).find(";")]
    topic_id = str(body)[str(body).find(";")+1:]

    # use thread pool executor to limit the number of threads spawned
    threadpoolexecutor.submit(
        consumer, ch, method, properties, body, (reviewId, topic_id)
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
    

    training_datetime = datetime(2024, 2, 7, 18, 47, 39)
    training_folder = Path(
        "../NLP/tm",            # for the program to locate the parent folder of this project
        f'bertopic_genre_indie_grid_search_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
    model_folder_path = training_folder.joinpath('bertopic_bt_nr_topics_40')
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