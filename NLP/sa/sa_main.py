from datetime import datetime
import json
import traceback
import numpy as np
from scipy.special import softmax

from pathlib import Path
import time

from string_cleaning_functions import clean, deEmojify
from transformers import AutoTokenizer
from onnxruntime import InferenceSession

import threading
from concurrent.futures import ThreadPoolExecutor
import functools
import pika
from pika import PlainCredentials


def cleaning(s_list: list[str]):
    s_list = list(map(clean, s_list))
    s_list = list(map(deEmojify, s_list))

    return s_list


def inference(s_list: list[str]):
    '''Inference to classify the sentiment of the list of strings
    return a list of integers, each integer represents the sentiment of the corresponding string in the input list
    integers should be either 1 or -1, where 1 = positive, -1 = negative

    :param s_list: list of strings to be classified

    return a list of integers, which contain the sentiment of the corresponding string in the input list
    '''
    s_list = cleaning(s_list)

    onnx_inputs = tokenizer(s_list, return_tensors="np",
                            max_length=tokenizer.model_max_length, truncation=True)
    onnx_outputs = session.run(output_names=output_names, input_feed=dict(
        onnx_inputs))                             # only get the unsoftmaxed logits
    # onnx_outputs is wrapped with a list with 1 element
    # example: [array([[-1.9537997,  1.9723034],
    #    [ 1.4555761, -1.4444611],
    #    [-1.9126643,  1.7959956],
    #    [ 1.7336161, -1.8159518]], dtype=float32)]
    proba = softmax(onnx_outputs[0], axis=1)
    sentiment = np.argmax(proba, axis=1)

    sentiment[sentiment == 0] = -1      # -1 as negative sentiment

    return sentiment


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
    result = inference([comment])       # wrap the comment as a list
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

    try:
        resultToBeSentBack = json.dumps({
        'reviewId': reviewId,
        'sentiment': result[0].item()       # numpy.int64 cannot be serialized, converting to the native int type
    })
    except Exception as e:
        print("Error encoding the result:", e)
        print(traceback.format_exc())
        return      # skip handling the message (?)

    now = datetime.now()
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")

    print(
        f'Result \"{resultToBeSentBack}\" sent by thread {threading.currentThread().ident} At Time {date_time}')
    try:
        local.channel.basic_publish(
            exchange='FYP_exchange', routing_key='FYP_TestQueue', body=f'Result \"{str(reviewId) + ";" + str(result[0])}\" sent by thread {threading.currentThread().ident}', mandatory=True)

        # the production queue
        # use the local thread channel to send back the result (to maintain thread-safe queue)
        local.channel.basic_publish(
            exchange='FYP_exchange', routing_key='FYP_SentimentAnalysisResult', body=resultToBeSentBack, mandatory=True)

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

    # body is a json string
    try:
        _body = json.loads(body)
        reviewId = int(_body['reviewId'])
        comment = _body['reviewComment']
    except json.JSONDecodeError as e:
        print("Error decoding the message:", e)
        print(traceback.format_exc())
        return
    except ValueError as e:
        print("Error parsing the reviewId:", e)
        print(traceback.format_exc())
        return

    # use thread pool executor to limit the number of threads spawned
    threadpoolexecutor.submit(
        consumer, ch, method, properties, body, (reviewId, comment)
    )


def listen_to_queue():

    # Establish connection
    channel, connection = init_connection()

    # Declare the queue
    channel.queue_declare(queue='SentimentAnalysisQueue', durable=True)

    channel.basic_qos(prefetch_count=5)

    # Start consuming messages
    on_message_callback = functools.partial(callback)
    channel.basic_consume(queue='SentimentAnalysisQueue',
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

    DATASET_SIZE = 240
    DATASET_IS_BALANCED = True

    training_name = 'bert-finetune_{}k_{}'.format(
        DATASET_SIZE,
        'bal' if DATASET_IS_BALANCED else 'imbal'
    )
    training_args_datetime = datetime(year=2023, month=12, day=18)

    model_folder_path = Path(
        "../NLP/sa",
        training_name,
        '{}_{}_model_onnx'.format(training_name, training_args_datetime.strftime('%Y-%m-%d'))).resolve()

    print(model_folder_path)

    # Load the ONNX model
    # load the ONNX model and tokenizer

    tokenizer = AutoTokenizer.from_pretrained(model_folder_path)
    session = InferenceSession(Path.joinpath(
        model_folder_path,
        "model_optimized.onnx")
    )

    input_names = [label.name for label in session.get_inputs()]
    output_names = [label.name for label in session.get_outputs()]

    # test inference with ONNX
    # inference(['I love this game', 'I hate this game', 'I like this game', 'I dislike this game'])

    # inference(['I like this game'])
    # inference(['I hate this game'])

    # create a threadpoolexecutor for multi-thread
    n_threads = 5
    threadpoolexecutor = ThreadPoolExecutor(max_workers=n_threads)

    listen_to_queue()
