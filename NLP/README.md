# NLP

Folder for NLP and Data Analysis related stuff

## Steam API

API to grab comments

Ofiicial documentation: [Documentation](https://partner.steamgames.com/doc/store/getreviews)

Supported Langauges: [Documentation](https://partner.steamgames.com/doc/store/localization/languages) (Look for the column 'API language code')

A sample API call is on Postman, under folder Steamworks API.

Scraping is safe, as long as not too frequent, quote  
"as long as you dont do it from 150 servers with 10k requests per second, they dont care a flip flop.
but due to respect of the service and webrequest limiters that will ban your ip, you might wanna throttle your query limit to about 10-15 per minute."
[Link](https://steamcommunity.com/discussions/forum/7/2254559285364750447/)

__steam-review-scraper by Zhihan-Zhu__

A small project to scrap steam reviews. Can confirm that the code is working as it matches with the documentation above. [Github](https://github.com/Zhihan-Zhu/steam-review-scraper) [Code](https://github.com/Zhihan-Zhu/steam-review-scraper/blob/master/steam_review_scraper/scraper.py)

## TODO

Write scraper according to the github code above.

* Scrap latest posted games review like a paper said, to provide accurate gameplay time.
* Scrap all comments of majority of games (top 50 (?) games per category), regardless of playtime
