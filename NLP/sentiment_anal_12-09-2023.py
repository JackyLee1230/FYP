
import pandas as pd
import numpy as np
from sys import argv

import re
import nltk

from pathlib import Path

from nltk.corpus import stopwords
# from nltk import WordNetLemmatizer
nltk.download('stopwords', quiet=True)


# from nltk.stem import PorterStemmer

####################
# Data cleaning functions
####################

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


# lemma=WordNetLemmatizer()

from nltk.corpus import stopwords

def remove_stopword(text):
   stop = set(stopwords.words("english"))
   text = [word.lower() for word in text.split() if word.lower() not in stop]
   return " ".join(text)


from nltk.stem import SnowballStemmer

def stemming(text):
   stem=[]
   # stopword = stopwords.words('english')
   snowball_stemmer = SnowballStemmer('english')
   word_tokens = nltk.word_tokenize(text)
   stemmed_word = [snowball_stemmer.stem(word) for word in word_tokens]
   stem=' '.join(stemmed_word)
   return stem

####################
# End of Data cleaning functions
####################

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

####################
# Load the trained model
####################

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer, TfidfTransformer
from sklearn.ensemble import RandomForestClassifier

import pickle
from pathlib import Path

filename = Path("NLP/steam-games-reviews-analysis-sentiment-analysis_model_12-09-2023.sav").resolve()
loaded_model = pickle.load(open(filename, 'rb'))

# we save the count vectorizer in section 5.5 also
filename_count_vec = Path('NLP/steam-games-reviews-analysis-sentiment-analysis_count_vectorizer_12-09-2023.pkl').resolve()
loaded_count_vec = pickle.load(open(filename_count_vec, "rb"))

# we save the fit tfidf (fit in pipeline2.fit())
filename_tfidf = Path('NLP/steam-games-reviews-analysis-sentiment-analysis_tfidf_12-09-2023.pkl').resolve()
loaded_tfidf = pickle.load(open(filename_tfidf, "rb"))

pipeline_target = Pipeline([
    ('count_vectorizer', loaded_count_vec),
    ('tfidf', loaded_tfidf),
    ('model', loaded_model)
])

####################
# End of Load the trained model
####################

def inference(s_list:list[str]):
    s_list = cleaning(s_list)
    result = pipeline_target.predict(s_list)
    return result

if __name__ == '__main__':
    
    # print(argv)
    
    parsingList = []
    
    for i in range(1,len(argv)):
        parsingList.append(argv[i])

    testing_list_2 = cleaning(parsingList)
    # print(testing_list_2)

    result = inference(parsingList)

    # print()
    # for i in range(len(parsingList)):
    #     print(f'Text: {parsingList[i]}\nResult: {result[i]}\n\n')
    
    print(result[0])