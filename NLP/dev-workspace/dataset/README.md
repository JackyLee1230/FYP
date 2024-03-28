# Datasets

The primary dataset is [Steam Reviews](https://www.kaggle.com/datasets/andrewmvd/steam-reviews) from Kaggle. It is identical with [Steam Review Dataset (Sobkowicz, 2017)](https://zenodo.org/records/1000885). The downloaded file (dataset.csv) can be place under folder _sa_

## Folder structure

|Folder|Details|
|---|---|
|data_scraping|Contain scripts to scrape recent comments and games information from Steam.|
|sa|Scripts to process the Steam Reviews Dataset, performing duplicate removal and checking number of words, and create different datasets for training different SA models.|
|steam-games|The scraped game information from Steam, containing over 100K games, scraped on 2023-10-17.|
|topic_modelling|Scripts to conduct EDA around the dataset, and create datasets for training topic models.|

|Files|Details|
|---|---|
|steam-review-scraper-apiver.ipynb|New scraper to scrape comments from Steam. Ignore the scripts under _steam_data_scraping/steam_data_scraping_ (which using [Scrapy](https://github.com/scrapy/scrapy), running slower than without setting request rate-limit in Scrapy)|