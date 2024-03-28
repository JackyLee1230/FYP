# Sentiment Analysis

The folder for deploying Sentiment Analysis service to our platform

## Folder structure

|Folder|Details|
|---|---|
|bert-finetune_480k_bal_2024-01-18|The fine-tuned model for sentiment analysis. It is fine-tuned from [BERT-base-cased](https://huggingface.co/google-bert/bert-base-cased)|
|docker_setup_files|Stores a list of required packages for deploying the service in a Docker container|

|Files|Details|
|---|---|
|Dockerfile|The Dockerfile for building the container|
|sa_main.py|The main program for sentiment analysis|
|str_cleaning_functions.py|Utility functions for text pre-processing before passing the game review to the fine-tuned BERT model|
