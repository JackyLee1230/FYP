# Topic Modeling Dataset Creation

To create different datasets for training topic modeling models.

Reviews from the preprocessed dataset are grouped by the game mentioned (through game ID) and the genre (through scrapped game information)

## How to use

Run _dataset_creation.ipynb_ after creating a dataset from running _../sa/dataset_creation_master_20240116.ipynb_

## Folder structure

Scripts

|File|Details|
|---|---|
|create_stopwords_from_games.ipynb|Stopwords selection|
|dataset_creation.ipynb|Script to create per-game reviews dataset (top 10 games) and create per-genre reviews dataset (top 11 genres)|
|eda.ipynb|Explorary Data Analysis (EDA) on the genre distribution of the games behind the reviews|
|eda_2.ipynb|EDA on the word frequency and stopwords|

Other files

|File|Details|
|---|---|
|game_name_list.txt|A list of valid game names scrapped using _../data_scraping/steam_data_scraping/steam-applist-scrapper.py_|
|stopwords.txt|A list of stopwords, created through _create_stopwords_from_games.ipynb_|
|stopwords_games.txt|A list of additional custom stopwords for topic modeling|
