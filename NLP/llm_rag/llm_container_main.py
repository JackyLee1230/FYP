from datetime import datetime
import json
import traceback
import pandas as pd
import numpy as np

from pathlib import Path
import time


import threading
from concurrent.futures import ThreadPoolExecutor
import functools
import pika
from pika import PlainCredentials


from llm_main import gen_TLDR_per_game
from _llm_rag_utils import _print_message


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
    gameId = inference_obj[0]

    start_time = time.time()

    try:
        # --------------------
        # LLM RAG per-game TLDR
        # --------------------
        tldr_per_game, token_usage_breakdown = gen_TLDR_per_game(game_id=gameId)        # includes error handling during the function.

        resultToBeSentBack = {
            'gameId': gameId,
            'tldr': tldr_per_game,
            'tokenUsageBreakdown': token_usage_breakdown
        }
    except Exception as e:
        print("Error in generating TLDR per game:", e)
        print(traceback.format_exc())

        tldr_per_game = None

        return
    
    if not tldr_per_game:       # safety check
        _print_message(f'No TLDR generated for game {gameId}.')
        return

    end_time = time.time()
    _print_message(f'Time taken for LLM per-game TLDR generation: {end_time-start_time:.2f}')

    resultToBeSentBack = json.dumps(resultToBeSentBack)

    _print_message(f'Result \"{resultToBeSentBack}\" sent by thread {threading.currentThread().ident} At Time {datetime.now().strftime("%m/%d/%Y, %H:%M:%S")}')


    # use a BlockingConnection per-thread
    # reuse created BlockingConnection if the thread in the threadpool has created one
    if not hasattr(local, 'channel'):
        thread_channel, _ = init_connection()
        thread_id = threading.currentThread().ident
        print(f'Thread {thread_id} created channel.')
        local.channel = thread_channel
        local.channel.confirm_delivery()

    
    # putting the result back to a result queue

    try:
        # enable the test queue for debugging
        local.channel.basic_publish(
            exchange='FYP_exchange', routing_key='FYP_TestQueue', body=f'Result \"{resultToBeSentBack}\" sent by thread {threading.currentThread().ident}', mandatory=True)
        
        # the production queue
        # use the local thread channel to send back the result (to maintain thread-safe queue)
        local.channel.basic_publish(
            exchange='FYP_exchange', routing_key='FYP_GameAggregationResult', body=resultToBeSentBack, mandatory=True)
    except pika.exceptions.UnroutableError as e:
        print("UnroutableError" + str(gameId) + ";" + e)

    # notify the RabbitQueue
    # acknowledge finish processing the msg to the channel in the main thread
    cb = functools.partial(ack_message, ch, method.delivery_tag)
    ch.connection.add_callback_threadsafe(cb)



def callback(ch, method, properties, body):
    # Process the received message
    _print_message(f"Received message: {body}")

    try:
        _body = json.loads(body)

        gameId = int(_body['gameId'])

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
        consumer, ch, method, properties, body, (gameId,)
    )

def listen_to_queue():

    # Establish connection
    channel, connection = init_connection()

    # Declare the queue
    channel.queue_declare(queue='GameAggregationQueue', durable=True)

    channel.basic_qos(prefetch_count=5)

    # Start consuming messages
    on_message_callback = functools.partial(callback)
    channel.basic_consume(queue='GameAggregationQueue',
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

if __name__ == '__main__':
    # create a threadpoolexecutor for multi-thread
    n_threads = 5
    threadpoolexecutor = ThreadPoolExecutor(max_workers=n_threads)

    listen_to_queue()