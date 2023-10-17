# Steam Data Scraping

Scrap the Steam catalogue to find all apps and their information (e.g. name, price, rating, developer, publisher etc.)

## Prerequistes

Have scrapy and scrapy-user-agents installed (in an environment)

```terminal
pip install scrapy
pip install scrapy-user-agents
```

## How to run

Simplier, more efficient scraper

```terminal
python steam-applist-scraper.py
```

Scrapy

```terminal
cd steam_data_scraping
scrapy crawl steam_apps
```

## Project Structure

|Folder|Description|
|---|---|
|checkpoints|Where the checkpoints of data scraped are stored.|
|steam_data_scraping|The scraper built using scrapy. Not maintained anymore.|

|File|Description|
|---|---|
|steam-applist-scraper.py|Scraper built using simple request and sleep when too much request error is received. Turns out more efficient then scrapy.|
|read_checkpoints.ipynb|Contains some functions to read the latest version of pickles (sorted by datetime value in the filename) in the folder _checkpoints_|
