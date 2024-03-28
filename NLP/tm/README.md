# Topic Modeling

The folder for deploying Topic Modeling service to our platform.

## File structure

|Folder|Details|
|---|---|
|bertopic[split]_genre_action_grid_search_20240301_095149|BERTopic model trained with reviews from action games.|
|bertopic[split]_genre_indie_grid_search_20240214_111556|BERTopic model trained with reviews from indie games.|
|bertopic[split]_grid_search_20240223_233739|BERTopic model trained with all reviews in the dataset.|
|docker_setup_files|Stores a list of required packages for deploying the service in a Docker container|
|game_specific_topic_name|A list of top 10 keywords and topic name for games.|
|model_specific_topic_name|A list of top 10 keywords and topic name for each type of BERTopic model (only for BERTopic model with 30 topics).|

|File|Details|
|---|---|
|_load_bertopic_models.py|Function to load the bertopic model from this folder|
|_tm_utils.py|Utilities and constants.|
|read_game_specific_topic_name_json.py|Functions to return the topic name of the inferenced topic, given the bertopic model used to process the review.|
|str_cleaning_functions.py|Utility functions for text pre-processing before passing the game review to the BERTopic model.|
|tm_bertopic_main.py|Main program of Topic Modeling, and LLM analysis when received a game review from the queue.|
