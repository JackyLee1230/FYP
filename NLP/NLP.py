from nltk.corpus import stopwords
import pika
from pika import PlainCredentials
from sklearn.pipeline import Pipeline

import pickle
from pathlib import Path
import time
import re
import nltk

from nltk.stem import SnowballStemmer

import threading
from concurrent.futures import ThreadPoolExecutor
import functools


def clean(raw):
    """ Remove hyperlinks and markup """
    result = re.sub("<[a][^>]*>(.+?)</[a]>", 'Link.', raw)
    result = re.sub('&gt;', "", result)
    result = re.sub('&#x27;', "'", result)
    result = re.sub('&quot;', '"', result)
    result = re.sub('&#x2F;', ' ', result)
    result = re.sub('<p>', ' ', result)
    result = re.sub('</i>', '', result)
    result = re.sub('&#62;', '', result)
    result = re.sub('<i>', ' ', result)
    result = re.sub("\n", '', result)
    return result


def remove_num(texts):
    output = re.sub(r'\d+', '', texts)
    return output


def deEmojify(x):
    regrex_pattern = re.compile(pattern="["
                                u"\U0001F600-\U0001F64F"  # emoticons
                                u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                                u"\U0001F680-\U0001F6FF"  # transport & map symbols
                                u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                                "]+", flags=re.UNICODE)
    return regrex_pattern.sub(r'', x)


def unify_whitespaces(x):
    cleaned_string = re.sub(' +', ' ', x)
    return cleaned_string


def remove_symbols(x):
    cleaned_string = re.sub(r"[^a-zA-Z0-9?!.,]+", ' ', x)
    return cleaned_string


def remove_punctuation(text):
    final = "".join(u for u in text if u not in (
        "?", ".", ";", ":",  "!", '"', ','))
    return final


def remove_stopword(text):
    global stop_nltk
    text = [word.lower()
            for word in text.split() if word.lower() not in stop_nltk]

    return " ".join(text)


def stemming(text):
    stem = []
    global snowball_stemmer

    word_tokens = nltk.word_tokenize(text)
    stemmed_word = [snowball_stemmer.stem(word) for word in word_tokens]
    stem = ' '.join(stemmed_word)
    return stem


def cleaning(s_list: list[str]):
    _s_list = list(map(clean, s_list))
    _s_list = list(map(deEmojify, _s_list))
    _s_list = list(map(lambda x: x.lower(), _s_list))
    _s_list = list(map(remove_num, _s_list))
    _s_list = list(map(remove_symbols, _s_list))
    _s_list = list(map(remove_punctuation, _s_list))
    _s_list = list(map(remove_stopword, _s_list))
    _s_list = list(map(unify_whitespaces, _s_list))
    _s_list = list(map(stemming, _s_list))
    return _s_list


def inference(s_list: list[str]):
    s_list = cleaning(s_list)
    result = pipeline_target.predict(s_list)
    return result


# reference: https://cloud.tencent.com/developer/article/1838485 (example 5)

# for threading
local = threading.local()


def init_connection():
    # Establish connection
    credentials = PlainCredentials('FYP', 'FYP')
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='137.184.216.126', port=5672, credentials=credentials))
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
    result = inference(comment)
    end_time = time.time()
    print('Time taken:', end_time-start_time)

    # use a BlockingConnection per-thread
    # reuse created BlockingConnection if the thread in the threadpool has created one
    if not hasattr(local, 'channel'):
        thread_channel, _ = init_connection()
        thread_id = threading.currentThread().ident
        print(f'Thread {thread_id} created channel.')
        local.channel = thread_channel

    # forming the result
    resultToBeSentBack = bytes(str(reviewId) + ";" + str(result[0]), 'utf-8')

    print(
        f'Result \"{str(reviewId) + ";" + str(result[0])}\" sent by thread {threading.currentThread().ident}')

    # test queue to not destroying the main queue
    local.channel.basic_publish(
        exchange='FYP_exchange', routing_key='FYP_TestQueue', body=f'Result \"{str(reviewId) + ";" + str(result[0])}\" sent by thread {threading.currentThread().ident}')

    # notify the RabbitQueue
    # acknowledge finish processing the msg to the channel in the main thread
    cb = functools.partial(ack_message, ch, method.delivery_tag)
    ch.connection.add_callback_threadsafe(cb)

    # the production queue
    # use the local thread channel to send back the result (to maintain thread-safe queue)
    local.channel.basic_publish(
        exchange='FYP_exchange', routing_key='FYP_SentimentAnalysisResult', body=resultToBeSentBack)


def callback(ch, method, properties, body):
    # Process the received message
    print("Received message:", body)
    # TODO: propose a JSON-like formating for msg
    # find the first occurance of ; and split it intwo two parts
    reviewId = str(body)[0: str(body).find(";")]
    comment = str(body)[str(body).find(";")+1:]

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
    filename = Path(
        "../NLP/steam-games-reviews-analysis-sentiment-analysis_model_12-09-2023.sav").resolve()
    loaded_model = pickle.load(open(filename, 'rb'))

    # we save the count vectorizer in section 5.5 also
    filename_count_vec = Path(
        '../NLP/steam-games-reviews-analysis-sentiment-analysis_count_vectorizer_12-09-2023.pkl').resolve()
    loaded_count_vec = pickle.load(open(filename_count_vec, "rb"))

    # we save the fit tfidf (fit in pipeline2.fit())
    filename_tfidf = Path(
        '../NLP/steam-games-reviews-analysis-sentiment-analysis_tfidf_12-09-2023.pkl').resolve()
    loaded_tfidf = pickle.load(open(filename_tfidf, "rb"))

    # preload every thing related to nltk to prevent from loading everytime
    stop_nltk = set(stopwords.words("english"))
    snowball_stemmer = SnowballStemmer('english')

    pipeline_target = Pipeline([
        ('count_vectorizer', loaded_count_vec),
        ('tfidf', loaded_tfidf),
        ('model', loaded_model)
    ])

    # create a threadpoolexecutor for multi-thread
    n_threads = 5
    threadpoolexecutor = ThreadPoolExecutor(max_workers=n_threads)

    listen_to_queue()
