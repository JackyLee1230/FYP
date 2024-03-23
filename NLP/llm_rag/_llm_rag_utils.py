from datetime import datetime
import json
from pathlib import Path

from enum import Enum

class RagType(Enum):
    PER_REVIEW = 1
    PER_GAME = 2

# copied from NLP/tm/read_game_specific_topic_name_json.py
# list of games supported with their own topic names
SPECIFIC_TOPIC_NAME_GAMES = [
    "Counter-Strike 2",
    "Cyberpunk 2077",
    "Cyberpunk 2077 Phantom Liberty",
    "Dota 2",
    "Monster Hunter World",
    "Monster Hunter World: Iceborne",
    "Starfield"
]

GAME_NAMES_TO_DB_NAME = {
    "Counter-Strike 2" : "counter-strike_2",
    "Cyberpunk 2077": "cyberpunk2077",
    "Cyberpunk 2077 Phantom Liberty": "cyberpunk2077_phantom_liberty",
    "Dota 2": "dota2",
    "Monster Hunter World": "monster_hunter_world",
    "Monster Hunter World: Iceborne": "monster_hunter_world_iceborne",
    "Starfield": "starfield"
}


def _print_message(message):
    '''Print message with a timestamp in front of it

    Timestamp format: YYYY-MM-DD HH:MM:SS,mmm
    '''
    print(f'{datetime.now().strftime("%Y-%m-%d %H:%M:%S,%f")[:-3]} - {message}')


####################
# Parsing the output from Mistral AI API to JSON object
####################
    

def _parsing_json_single(resp:str, aspects_response:dict, aspects:list):

    # gets the first '{' and last '}'
    first_brace = resp.find('{')
    last_brace = resp.rfind('}')

    resp_sub = resp[first_brace:] if last_brace == -1 else resp[first_brace:last_brace+1]

    try:
        resp_sub_json = json.loads(resp_sub)
        aspects_response.update(resp_sub_json)

    except:
        print(f'sub response: \'\'\'{resp_sub}\'\'\' is not a JSON. Resort to manual parse...')


    for i, aspect in enumerate(aspects):
        if ((f'\"{aspect}\"' not in resp_sub) and (f'\'{aspect}\'' not in resp_sub)):
            print(f'aspect: {aspect} not in resp_sub. Retry...')
            continue

        # manually get the JSON object by finding each aspect in the response
        # have to consider both single and double quotes
        # as mistral AI sometimes uses single quotes and sometimes double quotes
        # consider both single and double quotes, as mistral AI sometimes uses single quotes and sometimes double quotes
        resp_start = max(resp_sub.find(f'\"{aspect}\"'), resp_sub.find(f'\'{aspect}\'')) + len(f'\"{aspect}\"')
        value_start = max(resp_sub.find('\"', resp_start + 1), resp_sub.find('\'', resp_start + 1))
        value_end = max(resp_sub.find('\"', value_start + 1), resp_sub.find('\'', value_start + 1))

        # only update the value if it is empty (i.e. accept only first update for each aspect)
        if aspects_response[aspect] == '':
            aspects_response[aspect] = resp_sub[value_start + 1:value_end]
        

def _parsing_json_multiple(resp:str, open_brace_count:int, aspects_response:dict, aspects:list):

    prev_open_brace = -1
    prev_close_brace = -1

    for i in range(open_brace_count):
        # get the ith open brace and the immediate next close brace
        open_brace = resp.find('{' , prev_open_brace + 1)
        close_brace = resp.find('}', prev_close_brace + 1)

        # try to get the JSON object
        resp_sub = resp[open_brace:close_brace+1]

        try:
            resp_sub_json = json.loads(resp_sub)

            aspects_response.update(resp_sub_json)          # dict is inplace update
            

            # update the prev_open_brace and prev_close_brace ptrs if successful
            prev_open_brace = open_brace
            prev_close_brace = close_brace

            continue
        except:
            _print_message(f'sub response: \'\'\'{resp_sub}\'\'\' is not a JSON. Resort to manual parse...')

        # manually get the JSON object by finding each aspect in the response
        for i, aspect in enumerate(aspects):
            if ((f'\"{aspect}\"' not in resp_sub) and (f'\'{aspect}\'' not in resp_sub)):
                print(f'aspect: {aspect} not in resp_sub. Skipping...')
                continue

            # manually get the JSON object by finding each aspect in the response
            # have to consider both single and double quotes
            # as mistral AI sometimes uses single quotes and sometimes double quotes
            # consider both single and double quotes, as mistral AI sometimes uses single quotes and sometimes double quotes
            resp_start = max(resp_sub.find(f'\"{aspect}\"'), resp_sub.find(f'\'{aspect}\'')) + len(f'\"{aspect}\"')
            value_start = max(resp_sub.find('\"', resp_start + 1), resp_sub.find('\'', resp_start + 1))
            value_end = max(resp_sub.find('\"', value_start + 1), resp_sub.find('\'', value_start + 1))

            if aspects_response[aspect] == '':
                aspects_response[aspect] = resp_sub[value_start + 1:value_end]

        # update the prev_open_brace and prev_close_brace ptrs
        prev_open_brace = open_brace
        prev_close_brace = close_brace


# def get_mistral_API_key(llm_rag_folder:Path) -> str:
#     key_json_path = llm_rag_folder.joinpath('mistral_key.json')
#     with open(key_json_path, 'r') as f:
#         key_json = json.load(f)

#     return key_json['MISTRAL_API_KEY']