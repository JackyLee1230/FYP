# copy from dev-workspace/sa/string_cleaning_functions.py
# removed unnecessary code for bert model

import re
import html

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

    return result


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
