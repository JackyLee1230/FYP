import pika
from pika import PlainCredentials
from sklearn.pipeline import Pipeline

import pickle
from pathlib import Path
import time
import re
import nltk

from nltk.stem import SnowballStemmer

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
    regrex_pattern = re.compile(pattern = "["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                           "]+", flags = re.UNICODE)
    return regrex_pattern.sub(r'', x)

def unify_whitespaces(x):
    cleaned_string = re.sub(' +', ' ', x)
    return cleaned_string

def remove_symbols(x):
    cleaned_string = re.sub(r"[^a-zA-Z0-9?!.,]+", ' ', x)
    return cleaned_string

def remove_punctuation(text):
    final = "".join(u for u in text if u not in ("?", ".", ";", ":",  "!",'"',','))
    return final

from nltk.corpus import stopwords

def remove_stopword(text):
   stop = set(stopwords.words("english"))
   text = [word.lower() for word in text.split() if word.lower() not in stop]
   return " ".join(text)

def stemming(text):
   stem=[]
   # stopword = stopwords.words('english')
   snowball_stemmer = SnowballStemmer('english')
   word_tokens = nltk.word_tokenize(text)
   stemmed_word = [snowball_stemmer.stem(word) for word in word_tokens]
   stem=' '.join(stemmed_word)
   return stem

def cleaning(s_list:list[str]):
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

def inference(s_list:list[str]):
    s_list = cleaning(s_list)
    result = pipeline_target.predict(s_list)
    return result

def callback(ch, method, properties, body):
    # Process the received message
    print("Received message:", body)
    reviewId = str(body).split(";")[0]
    comment = cleaning([str(body).split(";")[1]])
    
    result = inference(comment)
    


    # Acknowledge the message
    resultToBeSentBack = bytes( str(reviewId) + ";" + str(result[0]), 'utf-8')
    print(str(reviewId) + ";" + str(result[0]))
    ch.basic_ack(delivery_tag=method.delivery_tag)
    ch.basic_publish(exchange='FYP_exchange', routing_key='FYP_SentimentAnalysisResult', body=resultToBeSentBack)

def listen_to_queue():

    # Establish connection
    credentials = PlainCredentials('FYP', 'FYP')                                     
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='137.184.216.126', port=5672, credentials=credentials))
    channel = connection.channel()

    # Declare the queue
    channel.queue_declare(queue='SentimentAnalysisQueue', durable=True)

    # Start consuming messages
    channel.basic_consume(queue='SentimentAnalysisQueue', on_message_callback=callback)

    try:
        # Keep the program running
        channel.start_consuming()
    except KeyboardInterrupt:
        # Close the connection upon interrupt signal (e.g., Ctrl+C)
        channel.stop_consuming()
        connection.close()

if __name__ == "__main__":
    filename = Path("../NLP/steam-games-reviews-analysis-sentiment-analysis_model_12-09-2023.sav").resolve()
    loaded_model = pickle.load(open(filename, 'rb'))

    # we save the count vectorizer in section 5.5 also
    filename_count_vec = Path('../NLP/steam-games-reviews-analysis-sentiment-analysis_count_vectorizer_12-09-2023.pkl').resolve()
    loaded_count_vec = pickle.load(open(filename_count_vec, "rb"))

    # we save the fit tfidf (fit in pipeline2.fit())
    filename_tfidf = Path('../NLP/steam-games-reviews-analysis-sentiment-analysis_tfidf_12-09-2023.pkl').resolve()
    loaded_tfidf = pickle.load(open(filename_tfidf, "rb"))

    end_time = time.time()

    pipeline_target = Pipeline([
        ('count_vectorizer', loaded_count_vec),
        ('tfidf', loaded_tfidf),
        ('model', loaded_model)
    ])
    
    listen_to_queue()