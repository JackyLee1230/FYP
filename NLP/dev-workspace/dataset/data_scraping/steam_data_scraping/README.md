# Steam Data Scraping

Scrap the Steam catalogue to find all apps and their information (e.g. name, price, rating, developer, publisher etc.)

## Prerequistes

Have scrapy and scrapy-user-agents installed (in an environment)

```terminal
pip install scrapy
pip install scrapy-user-agents
```

## How to run

```terminal
cd steam_data_scraping
scrapy crawl steam_apps
```

## Project Structure

|Folder|Description|
|---|---|
|checkpoints|Where the checkpoints of data scraped are stored.|
|checkpoints_old|other checkpoints scraped before.|
|steam_data_scraping|The scraper built using scrapy|
