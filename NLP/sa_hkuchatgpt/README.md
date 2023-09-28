# HKU ChatGPT automation project

Automate HKU ChatGPT to create labels for sentiment analysis.

## Setup

You should have chrome installed.

requires the following packages. install as below

requires pandas >= 2.1.0

```
conda install pandas
conda install numpy
conda install selenium
pip install selenium-wire
pip install undetected-chromedriver
```

## Usage

1. create a json file called _secret.json_ and place the json file in the same directory as the _hkuchatgpt.py_  
Then copy the template below to the json file.  
Fill in your own HKU email and pw

    ```json
    {
        "my_email":"<UID>@connect.hku.hk",
        "my_pw":"<your_password>"
    }
    ```

2. cd to this directory and run as below to test the functionality of the program.  
It runs 10 query which each costs on average 150 tokens.

    ```
    python hkuchatgpt.py
    ```

## Sentiment Analysis Workflow

I prepared a _main.py_ for running sentiment analysis labelling automatically using HKU ChatGPT 3.5 service.

I also prepared a folder of randomly sampled comments (which are not targetting any specific genre/a title) from the steam comment dataset sourced from Kaggle. The comments should have no foul language (as they are replaced with '♥' symbol), nor meaningless Early Review Access comments (with only "Early Review Access"), as I filtered them out in a separate script namely _create_dataset.ipynb_

Please go the the _main.py_ script and modify the name of the file to run with according to the instruction below.  
Notice the version of pandas should be >= 2.1.0, as stated in the section **Setup**

### How to modify?

To _main.py_ script, the section:

```python
dataset_folder = Path('dataset_cleaned_heartless_sampled_20230927').resolve()
base_file = Path(dataset_folder, 'dataset_cleaned_heartless_sampled_20230927_chunk_000.pkl').resolve()
```

The variable _dataset_folder_ is the folder storing the sanpled comments, each with 3000 rows.

**Change the string of _base_file_ variable to be one of the different chunks in the folder _dataset_folder_. Example:**

```python
base_file = Path(dataset_folder, 'dataset_cleaned_heartless_sampled_20230927_chunk_001.pkl').resolve()
```

Then find the variable _NUM_OF_REQUEST_PER_SAVE_  
This variable is to create a checkpoint after NUM_OF_REQUESTS_PER_SAVE rows. Nodify the variable as you like.

```python
REQUESTS_PER_MINUTE = 6     # fixed constant, set by the API
# ...
NUM_OF_REQUESTS_PER_SAVE = REQUESTS_PER_MINUTE * 5
```

Then find the variable.  
This variable is to set the threshold of remaining tokens, such that the program will terminates, and saves all processed data, to avoid using all tokens available.

```python
BALANCE_LIMIT = 5000
```

For reviewing your results, I prepared a file called _read_dataset_from_pickle.ipynb_ to load and show the .pkl file.

## Fine-tuning

For the messages to be sent to chatgpt, edit the messages parameter of the json in main.py

For other parameters of chatgpt (which is Azure chatgpt), can add global parameters according to the stated examples in Azure chatgpt website. The link can be found in _hkuchatgpt.py_
