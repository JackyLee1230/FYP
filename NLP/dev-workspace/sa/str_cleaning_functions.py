import re
import html
import nltk

def remove_links(x):
    '''Ref: https://stackoverflow.com/questions/11331982/how-to-remove-any-url-within-a-string-in-python'''
    cleaned_string = re.sub(r'(https?:\/\/)(\s)*(www\.)?(\s)*((\w|\s)+\.)*([\w\-\s]+\/)*([\w\-]+)((\?)?[\w\s]*=\s*[\w\%&]*)*', ' ', x)
    return cleaned_string

def remove_links2(x):
    '''Ref: https://stackoverflow.com/questions/11331982/how-to-remove-any-url-within-a-string-in-python'''
    cleaned_string = re.sub(r'[^ ]+\.[^ ]+',' ',x)
    return cleaned_string

def clean(raw):
    """ Remove html tags and convert html entity reference to its corresponding character"""
    # instead of removing the html entity reference through regex
    # we can use the html.unescape() function to convert the html entity reference to its corresponding character
    # then it's upto future text cleaning to remove the character or not
    result = html.unescape(raw)
    result = re.sub(r"<?[\w\s]*>|<.+[\W]>", '', result)     # remove html tags

    # result = re.sub('&gt;', ">", result)
    # result = re.sub('&lt;', "<", result)
    # result = re.sub('&#x27;', "'", result)
    # result = re.sub('&quot;', '"', result)
    # result = re.sub('&#x2F;', ' ', result)
    # result = re.sub('<p>', ' ', result)
    # result = re.sub('</i>', ' ', result)
    # result = re.sub('&#62;', ' ', result)
    # result = re.sub('<i>', ' ', result)
    return result

# def remove_num(texts):
#    output = re.sub(r'\d+', '', texts)
#    return output

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

# def remove_symbols(x):
#     cleaned_string = re.sub(r"[^a-zA-Z0-9?!.,]+", ' ', x)
#     return cleaned_string

# the remove_non_letters removed all numbers and punctuations
# then keep the ascii letters only
def remove_non_letters(text):
    '''Keep only ascii A-Z, a-z and whitespaces.

    Thus remove all numbers, punctuations and symbols
    '''
    final = re.sub(r'[^a-zA-Z ]+', ' ', text)
    return final

# def remove_punctuation(text):
#     final = "".join(u for u in text if u not in ("?", ".", ";", ":",  "!",'"',','))
#     return final

from nltk.corpus import stopwords
from nltk import WordNetLemmatizer
# nltk.download('stopwords')
from nltk.stem import PorterStemmer

stop=set(stopwords.words("english"))
stemmer=PorterStemmer()
lemma=WordNetLemmatizer()

def remove_stopword(text):
   text=[word.lower() for word in text.split() if word.lower() not in stop]
   return " ".join(text)

from nltk.stem import SnowballStemmer

snowball_stemmer = SnowballStemmer('english')

def stemming(text):
   stem=[]
   # stopword = stopwords.words('english')
   word_tokens = nltk.word_tokenize(text)
   stemmed_word = [snowball_stemmer.stem(word) for word in word_tokens]
   stem=' '.join(stemmed_word)
   return stem

def cleaning_df(df,review):
    '''apply all cleaning functions to a dataframe column
    '''
    df[review] = df[review].apply(clean)
    df[review] = df[review].apply(deEmojify)
    df[review] = df[review].apply(remove_non_letters)
    df[review] = df[review].str.lower()
    # df[review] = df[review].apply(remove_num)
    # df[review] = df[review].apply(remove_symbols)
    # df[review] = df[review].apply(remove_punctuation)
    df[review] = df[review].apply(unify_whitespaces)
    df[review] = df[review].apply(remove_stopword)
    df[review] = df[review].apply(unify_whitespaces)
    df[review] = df[review].apply(stemming)
    df[review] = df[review].apply(unify_whitespaces)

def cleaning_arr(str_arr):
    '''apply all cleaning functions to a numpy array, or a pandas series object'''
    str_arr = str_arr.apply(lambda x: clean(x))
    str_arr = str_arr.apply(lambda x: deEmojify(x))
    str_arr = str_arr.apply(lambda x: remove_non_letters(x))
    str_arr = str_arr.apply(lambda x: x.lower())
    # str_arr = str_arr.apply(lambda x: remove_num(x))
    # str_arr = str_arr.apply(lambda x: remove_symbols(x))
    # str_arr = str_arr.apply(lambda x: remove_punctuation(x))
    str_arr = str_arr.apply(lambda x: unify_whitespaces(x))
    str_arr = str_arr.apply(lambda x: remove_stopword(x))
    str_arr = str_arr.apply(lambda x: unify_whitespaces(x))
    str_arr = str_arr.apply(lambda x: stemming(x))
    str_arr = str_arr.apply(lambda x: unify_whitespaces(x))

    return str_arr

def cleaning_pyarr(str_arr):
    '''apply all cleaning functions to a python array'''
    str_arr = list(map(clean, str_arr))
    str_arr = list(map(deEmojify, str_arr))
    str_arr = str_arr.apply(lambda x: remove_non_letters(x))
    str_arr = list(map(str.lower, str_arr))
    # str_arr = list(map(remove_num, str_arr))
    # str_arr = list(map(remove_symbols, str_arr))
    # str_arr = list(map(remove_punctuation, str_arr))
    str_arr = list(map(unify_whitespaces, str_arr))
    str_arr = list(map(remove_stopword, str_arr))
    str_arr = list(map(unify_whitespaces, str_arr))
    str_arr = list(map(stemming, str_arr))
    str_arr = list(map(unify_whitespaces, str_arr))

    return str_arr