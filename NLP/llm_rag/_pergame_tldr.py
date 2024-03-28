from pathlib import Path
import pickle, traceback, sys, os, json
import requests

import pandas as pd
import numpy as np



####################
# Prompts
####################

SYSTEM_TEMPLATE = \
'''You have access to a pandas dataframe `df`. {description_of_the_table}
Here is the output of `df.to_markdown()`:
```
{df_markdown}
```
'''

# TODO: can further optimize?? Currently this is copied from IELTS academic writing task 1
PROMPT_TEMPLATE = \
'''Summarise the information by selecting and reporting the main features, and main comparisons where relevant. {df_specific_task}
Output a paragraph with less than 50 words.
Only output the paragraph. Do NOT output other text.'''


DESCRIPTION_AGEREVIEW_DF = \
'''df is a dataframe that describes the distribution of reviews by age group.'''

DESCRIPTION_GENDERREVIEW_DF = \
'''df is a dataframe that describes the distribution of reviews by gender'''

DESCRIPTION_SENTIMENT_DF = \
'''df is a dataframe that describes the distribution of reviews with different sentiments (positive and negative)'''

DESCRIPTION_SENTIMENT_BY_AGEGROUP_DF = \
'''df is a dataframe that describes the distribution of positive and negative reviews by age group'''

DESCRIPTION_SENTIMENT_BY_GENDER_DF = \
'''df is a frame that describes the distribution of positive and negative reviews by gender'''


SPECIFIC_TASK_REQ_AGEREVIEW_DF = \
'''Describe the most common age group that reviews the game.'''

SPECIFIC_TASK_REQ_GENDERREVIEW_DF = \
''''''

SPECIFIC_TASK_REQ_SENTIMENT_DF = \
'''Describe whether positive or negative reviews are more common, and how common are they.'''

SPECIFIC_TASK_REQ_SENTIMENT_BY_AGEGROUP_DF = \
'''Describe the most common sentiment across different age group.'''

SPECIFIC_TASK_REQ_SENTIMENT_BY_GENDER_DF = \
''''''
# '''Describe the common sentiment across players with different gender'''


TLDR_PERGAME_PROMPT_TEMPLATE = \
'''Write a summary of the game based on the revies of each aspects, the sentiment results of the reviews, and the most mentioned topics of all reviews. The summary should be less than 200 words. Do NOT try to make up an answer. Only output the summary. Do NOT output other text.

The reviews are as follows:
\'\'\'
{aspect_content}
\'\'\'

The sentiment results are as follows:
\'\'\'
{sentiment_content}
\'\'\'

The most mentioned topics name are: {topic_names}

Do NOT try to make up an answer. Only output the summary. Do NOT output other text.
'''


PROMPT_PER_DFS = {
    'ageReviews': DESCRIPTION_AGEREVIEW_DF,
    'genderReviews': DESCRIPTION_GENDERREVIEW_DF,
    'sentimentReviews': DESCRIPTION_SENTIMENT_DF,
    'sentimentByAgeGroup': DESCRIPTION_SENTIMENT_BY_AGEGROUP_DF,
    'sentimentByGender': DESCRIPTION_SENTIMENT_BY_GENDER_DF
}

SPECIFIC_TASK_REQS_PER_DFS = {
    'ageReviews': SPECIFIC_TASK_REQ_AGEREVIEW_DF,
    'genderReviews': SPECIFIC_TASK_REQ_GENDERREVIEW_DF,
    'sentimentReviews': SPECIFIC_TASK_REQ_SENTIMENT_DF,
    'sentimentByAgeGroup': SPECIFIC_TASK_REQ_SENTIMENT_BY_AGEGROUP_DF,
    'sentimentByGender': SPECIFIC_TASK_REQ_SENTIMENT_BY_GENDER_DF
}

assert set(PROMPT_PER_DFS.keys()) == set(SPECIFIC_TASK_REQS_PER_DFS.keys()), 'PROMPT_PER_DFS and SPECIFIC_TASK_REQS_PER_DFS have different keys'


# helper functions
def _load_sa_results_from_local(game_name:str, game_steamid:int):
    '''
    params
    - game_name: str, the name of the game from API call. Currently is the folder name
    '''

    # load the reviews from folder

    reviews_reqs = []

    # get existing folder and retrieve the cursor object (?)

    # load the latest file
    # game_folder = Path(f'../../dataset/data_scraping/steam_comments_scraping/{game_name}')
    game_folder = Path(f'../../../FYP/NLP/dev-workspace/dataset/data_scraping/steam_comments_scraping/{game_name}')

    if game_folder.exists():
        try:
            latest_file_path = game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis.pkl')
            with open(latest_file_path, 'rb') as f:
                reviews_reqs = pickle.load(f)           # retrieve the list of reviews
                print('Loaded:', latest_file_path)
        except IndexError as e:
            print('Error loading the latest file:', e)
            traceback.print_exc()

    print()

    # also load different generated data
    ageReviews_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_ageGroup.csv'), index_col=None)
    ageReviews_df = ageReviews_df.dropna()
    print('Loaded ageReviews_df')
    genderReviews_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_genderReviews.csv'), index_col=None)
    genderReviews_df = genderReviews_df.dropna()
    genderReviews_df = genderReviews_df[genderReviews_df['gender'].isin(['MALE', 'FEMALE'])]
    print('Loaded genderReviews_df')
    sentimentReviews_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_sentimentReviews.csv'), index_col=None)
    sentimentReviews_df = sentimentReviews_df.dropna()
    print('Loaded sentimentReviews_df')
    sentimentReviews_truelabel_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_sentimentReviews_truelabel.csv'), index_col=None)
    print('Loaded sentimentReviews_truelabel_df')
    sentimentByAgeGroup_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_sentimentByAgeGroup.csv'), index_col=None)
    print('Loaded sentimentByAgeGroup_df')
    sentimentByGender_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_sentimentByGender.csv'), index_col=None)
    print('Loaded sentimentByGender_df')


    # load the topic modeling analysis
    topicFreq_df = pd.read_csv(game_folder.joinpath(f'steam_reviews_{game_steamid}_unique_with_gendata_with_analysis_topic_freq.csv'), index_col=None)
    print('Loaded topicFreq_df')

    dfs = {
        'ageReviews': ageReviews_df,
        'genderReviews': genderReviews_df,
        'sentimentReviews': sentimentReviews_df,
        'sentimentByAgeGroup': sentimentByAgeGroup_df,
        'sentimentByGender': sentimentByGender_df, 
        'topicFreq': topicFreq_df
    }

    return dfs

# supported game and their id on the fyp platform
# only the key matters
TLDR_PERGAME_SUPPORTED_GAMES = {
    1: 'Counter-Strike 2',
    4: 'Monster Hunter World',
    5: 'Cyberpunk 2077',
    7: 'Cyberpunk 2077 Phantom Liberaty',
    8: 'Starfield',
    9: 'Dota 2',
    30: 'Monster Hunter World: Iceborne'
}

# just store in the script is OK
DOMAIN = 'https://critiqbackend.itzjacky.info'
PORT = 9000
GENDERS = ['MALE', 'FEMALE', "OTHER", "UNDISCLOSED", "N/A"]     # shd be consistent with the API & sqldb

def _get_gameAnalystic_result_from_api(game_id:int):
    api = f'{DOMAIN}:{PORT}/api/game/gameAnalytic'

    # send the data to the backend
    try:
        req = requests.post(api, json={"id":game_id})
        return_json = req.json()
    except Exception as e:
        print('Error:', e)
        traceback.print_exc()
        return None
    
    return return_json


def _load_sa_results_from_api_result(gameAnalystic_json:dict):
    
    # create ageReviews df
    ageReviews_json = {}
    ageReviews_from_api = gameAnalystic_json['ageReviews']
    for k, v in ageReviews_from_api.items():
        ageReviews_json[k] = v

    ageReviews_df = pd.DataFrame(ageReviews_json.items(), columns=['age_group', 'count'])
    ageReviews_df.sort_values(by='age_group', inplace=True)
    ageReviews_df.reset_index(drop=True, inplace=True)
    print('Loaded ageReviews_df')


    # create genderReviews df
    genderReviews_json = {k:0 for k in GENDERS}     # define the ordering in genderReviews_df
    genderReviews_from_api = gameAnalystic_json['genderReviews']
    for k, v in genderReviews_from_api.items():
        genderReviews_json[k] = v

    genderReviews_df = pd.DataFrame(genderReviews_json.items(), columns=['gender', 'count'])
    print('Loaded genderReviews_df')


    # create sentimentReviews_df

    sentimentReviews_json = {k:0 for k in ['POSITIVE', 'NEGATIVE', "N/A"]}
    sentimentReviews_from_api = gameAnalystic_json['sentimentReviews']
    for k, v in sentimentReviews_from_api.items():
        sentimentReviews_json[k] = v

    sentimentReviews_df = pd.DataFrame(sentimentReviews_json.items(), columns=['sentiment', 'count'])
    print('Loaded sentimentReviews_df')


    # create sentimentByAgeGroup_df

    # get all possible combination of (age_group, sentiment)
    sentimentByAgeGroup = []

    sentimentByAgeGroup_from_api = gameAnalystic_json['sentimentReviewsByAge']
    for sentiment, sentiment_json in sentimentByAgeGroup_from_api.items():
        for age_group, count in sentiment_json.items():
            sentimentByAgeGroup.append((age_group, sentiment, count))

    # create a three column df
    sentimentByAgeGroup_df = pd.DataFrame(sentimentByAgeGroup, columns=['age_group', 'sentiment', 'count'])
    # reorder columns
    sentimentByAgeGroup_df = sentimentByAgeGroup_df[['sentiment', 'age_group', 'count']]
    # sort by sentiment, then age_group
    sentimentByAgeGroup_df = sentimentByAgeGroup_df.sort_values(by=['sentiment', 'age_group'])

    # drop row with count = 0
    sentimentByAgeGroup_df = sentimentByAgeGroup_df[sentimentByAgeGroup_df['count'] > 0]
    print('Loaded sentimentByAgeGroup_df')


    # sentimentByGender_df

    # get all possible combination of (gender, sentiment)
    sentimentByGender = []

    for sentiment, sentiment_json in gameAnalystic_json['sentimentReviewsByGender'].items():
        for gender, count in sentiment_json.items():
            sentimentByGender.append((sentiment, gender, count))

    # create a three column df
    sentimentByGender_df = pd.DataFrame(sentimentByGender, columns=['sentiment','gender', 'count'])
    # sort by sentiment then gender
    sentimentByGender_df = sentimentByGender_df.sort_values(by=['sentiment', 'gender'])
    # drop rows with count = 0
    sentimentByGender_df = sentimentByGender_df[sentimentByGender_df['count'] > 0]
    print('Loaded sentimentByGender_df')


    # topicFreq_df

    topicFreq = []

    for topic, val in gameAnalystic_json['topicFrequency'].items():
        topicFreq.append((topic, val['freq'], val['name']))

    topicFreq_df = pd.DataFrame(topicFreq, columns=['Topic', 'Count', 'Topic Name'])
    topicFreq_df = topicFreq_df.sort_values(by='Topic', ascending=True)
    print('Loaded topicFreq_df')

    dfs = {
        'ageReviews': ageReviews_df,
        'genderReviews': genderReviews_df,
        'sentimentReviews': sentimentReviews_df,
        'sentimentByAgeGroup': sentimentByAgeGroup_df,
        'sentimentByGender': sentimentByGender_df, 
        'topicFreq': topicFreq_df
    }

    return dfs
