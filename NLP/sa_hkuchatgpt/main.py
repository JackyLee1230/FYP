import json
import os
from pathlib import Path
from queue import Queue
import random
import re
import time
from hkuchatgpt import HkuChatGPT
import pandas as pd
import numpy as np


def load_secret_json(secret_json_path: Path):
    '''Read login email and password from a json file'''
    secret_json = json.load(open(secret_json_path))

    my_email, my_pw = secret_json['my_email'], secret_json["my_pw"]

    return my_email, my_pw


def check_for_checkpoint(ckpt_folder:Path, base_file: Path):
    '''Search for any checkpoints file. Return the latest checkpoint file (with the largest index), and the index of the file.

    Else return the base_file

    params:
    dataset_folder: the folder contains a specific dataset and all checkpoints.
    base_file: the raw file without any checkpoints suffix.
    '''
    all_pkl = []
    for root, dirs, files in os.walk(ckpt_folder):
        all_pkl = list(map(lambda f: Path(root, f), files))
        all_pkl = [p for p in all_pkl if p.suffix == '.pkl']
        break       # only scan for 1 level, not looking for directories inside the folder

    # get checkpoint files, containing the keyword 'ckpt'
    checkpoint_files = [f for f in all_pkl if "ckpt" in f.name]

    if checkpoint_files:

        get_index = lambda f: int(re.search(f"{base_file.stem}_ckpt_([0-9]*){base_file.suffix}", f.name)[1])
        # filename looks like 'file_name' + '_ckpt_' + '123' + '.pkl'
        largest_index_file = max(
            checkpoint_files, key=get_index
        )
        largest_index = get_index(largest_index_file)

        return largest_index_file, largest_index
    else:
        return base_file, 0
    
def load_pickle(path_to_load:Path) -> pd.DataFrame:
    df = pd.read_pickle(path_to_load)
    print('\n')
    print(f'Successfully loaded df from {str(path_to_load)}')
    # print(df.head())
    return df


def save_checkpoints(df:pd.DataFrame, base_file: Path, index:int, ckpt_folder:Path):
    '''Save df as checkpoints of that run, for resuming later.'''
    # reserve at least three digits for the index
    # if index = 1234 -> xxx_ckpt_1234.pkl
    save_filename = base_file.stem + '_ckpt_' + '{:03}'.format(index) + '.pkl'
    path_to_save = ckpt_folder.joinpath(save_filename)

    if not ckpt_folder.exists():
        ckpt_folder.mkdir(parents=True)

    write_pickle(path_to_save, df)

def write_pickle(path_to_save:Path, df:pd.DataFrame):
    df.to_pickle(str(path_to_save))
    print('\n')
    print(f'Successfully saved df to {str(path_to_save)}')


def generate_chatgpt_input(df_processing:pd.DataFrame, current_processing_index, sentiment = ['positive', 'neutral', 'negative']):
    if current_processing_index > max(df_processing.index):
        return {
            "index": -1,
            "messages": []
        }           # End Of Processing symbol

    else:
        row = df_processing.loc[current_processing_index]
        chatgpt_input = {
            "index":current_processing_index,              # for tracking and putting result to dataframe
            "messages": [               # = chatgpt 'messages' object
                {
                    "role": "system",
                    "content": f"""You are the producer of the game called {row['app_name']}. You are analyzing the comments from players to find out how the players feel towards your game."""
                },
                {
                    "role": "user",
                    # "content": f"""Determine from {sentiment}: probabilities. Format: [Sentiment: Probabilities for each sentiment]. Alternatively , state "NA". Do not output other things except the Format. ‘‘‘{row['review_text']}‘‘‘"""
                    # "content": f"""Determine from {sentiment}: probabilities. Provide them in JSON format with the following keys: {', '.join(sentiment)}. Alternatively , state "NA". Output the probabilities correct to four decimal points. Do not output other things except the format. ‘‘‘{row['review_text']}‘‘‘"""
                    "content": f"""Determine from {sentiment}: probabilities. Provide them in JSON format with the following keys: {', '.join(sentiment)}. Alternatively , state "NA". Do not output other things except the format. ‘‘‘{row['review_text']}‘‘‘"""          # implicity it will output 1 d.p., yet it will not have more precise result d.p. even you explicitly said output to more d.p.
                }
            ]
        }

        return chatgpt_input



def main():
    secret_json_path = Path("secret.json").resolve()
    my_email, my_pw = load_secret_json(secret_json_path)
    
    # CHANGE HERE !!
    dataset_folder = Path('dataset_cleaned_heartless_sampled_20230927').resolve()
    base_file = Path(dataset_folder, 'dataset_cleaned_heartless_sampled_20230927_chunk_000.pkl').resolve()

    # create a folder to store ckpt under dataset folder
    ckpt_folder = Path(dataset_folder, base_file.stem + '/').resolve()
    if not ckpt_folder.exists():
        ckpt_folder.mkdir()

    # check for checkpoints
    # filename looks like 'file_name' + '_ckpt_' + '123' + '.pkl'
    df_filepath, curr_ckpt_index = check_for_checkpoint(ckpt_folder, base_file)

    # load data
    df = load_pickle(df_filepath)
    
    print(df.head(10))

    # check if column exists or not
    # for continuation
    if 'total_token_used' not in df.columns:
        df['response'] = ""
        df['total_token_used'] = -1

    # locate the index of first row with total_token_used = -1
    # for continuation as well
    first_empty_row_index = df[df['total_token_used'] == -1].index[0]
    current_processing_index = first_empty_row_index

    # skip rows that are processed
    df_processing = df[df.index >= first_empty_row_index]
    # print(df_processing)
 
    # create queues for passing messages to HKU ChatGPT
    # input_queue = Queue()
    output_queue = Queue()


    # generate 'messages' object identical to chatgpt api
    sentiment = ['positive', 'neutral', 'negative']

    # an instance of HKU ChatGPT
    chatgpt = HkuChatGPT(my_email, my_pw, None, output_queue)

    chatgpt.start()

    REQUESTS_PER_MINUTE = 6     # fixed constant, set by the API
    ONE_MINUTE = 62             # purposely add some buffer preventing triggering rate limit
    remaining_sec_per_minute = ONE_MINUTE
    sleep_interval = [3, 12]

    
    # CHANGE HERE !!
    NUM_OF_REQUESTS_PER_SAVE = REQUESTS_PER_MINUTE * 5

    # CHANGE HERE !!
    # the remaining token that the programs stops if remaining token is below this number
    BALANCE_LIMIT = 5000

    # loop to go through requests
    while(True):
        # chatgpt_input = input_queue.get()

        # generate request on the fly
        chatgpt_input = generate_chatgpt_input(
            df_processing, current_processing_index, sentiment
        )

        if chatgpt_input == None:
            print('Input queue is empty. Exit loop.')
            break
    
        if chatgpt_input['index'] == -1:
            print('--------------------')
            print('End of Processing.')
            print('--------------------')
            break

        if chatgpt.get_current_balance() < BALANCE_LIMIT:
            print(f"HKU ChatGPT balance: {chatgpt.get_current_balance()} , is lower than pre-defined limit: {BALANCE_LIMIT}.")
            print("The program terminates itself.")
            break

        chatgpt.run(chatgpt_input)

        while (True):
            # wait for output from chatgpt
            chatgpt_response = output_queue.get()

            chatgpt_response_index = chatgpt_response['index']

            # not using as -1 -> end of processing
            # 429 = statuscode for too many request
            if chatgpt_response_index == -429:
                # msg example:
                # "Rate limit is exceeded. Try again in 7 seconds."
                chatgpt_response_msg = chatgpt_response['chatgpt_response_msg']
                
                no_of_sec_to_sleep = float(re.search("([0-9]+)", chatgpt_response_msg)[1])

                # sleep for 1 sec to wait for the alert popped up.
                time.sleep(1)

                chatgpt.alert_handler()

                time.sleep(no_of_sec_to_sleep)

                chatgpt.run(chatgpt_input)      # re-run after handling rate limit alert.
            elif chatgpt_response_index < 0:
                # other errors 
                # model error, usually contain some content in the prompt that violates the ChatGPT policy
                # e.g. "message": "The response was filtered due to the prompt triggering Azure OpenAI’s content management policy. Please modify your prompt and retry. To learn more about our content filtering policies please read our documentation: https://go.microsoft.com/fwlink/?linkid=2198766",

                # handling: handle the alert then just skip it :D

                time.sleep(1)

                # wait for any alert, then stop it
                chatgpt.alert_handler()

                time.sleep(1)

                break

            elif chatgpt_response_index >= 0:
                break

        # chatgpt_response = output_queue.get()

        if chatgpt_response == None:
            break

        chatgpt_response_index = chatgpt_response['index']
        chatgpt_response_msg = chatgpt_response['chatgpt_response_msg']
        total_token_used = chatgpt_response['total_tokens_used']

        # update dataframe (the original one)'
        df.at[chatgpt_response_index, 'response'] = chatgpt_response_msg
        df.at[chatgpt_response_index, 'total_token_used'] = total_token_used

        # sleep for random seconds to prevent hitting the rate limit
        # this reduces chance for detection (even though I implemented rate limit alert box handler)
        if ((chatgpt_input['index'] + 1) % REQUESTS_PER_MINUTE == 0):
            sleep_duration = remaining_sec_per_minute
        else:
            sleep_duration = random.randint(min(sleep_interval), max(sleep_interval))

        print('Sleep duration:', sleep_duration)

        time.sleep(sleep_duration)
        remaining_sec_per_minute -= sleep_duration
        
        # reset requests limit (as one minute has passed)
        if ((chatgpt_input['index'] + 1) % REQUESTS_PER_MINUTE == 0):
            remaining_sec_per_minute = ONE_MINUTE

        # save as checkpoints per a fixed number of requests processed
        if ((chatgpt_input['index'] + 1) % NUM_OF_REQUESTS_PER_SAVE == 0):
            # ckpt index is one based
            curr_ckpt_index += 1
            save_checkpoints(df, base_file, curr_ckpt_index, ckpt_folder)

        
        current_processing_index += 1


    curr_ckpt_index += 1
    save_checkpoints(df, base_file, curr_ckpt_index, ckpt_folder)

    print(f"Successfully handled all rows of {base_file}.")
    print("Program terminates.")
        

if __name__ == '__main__':
    main()