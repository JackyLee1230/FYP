from pathlib import Path
import pickle, traceback, sys, os, json

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




