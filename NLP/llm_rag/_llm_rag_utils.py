from datetime import datetime
import json
from pathlib import Path

def _print_message(message):
    '''Print message with a timestamp in front of it

    Timestamp format: YYYY-MM-DD HH:MM:SS,mmm
    '''
    print(f'{datetime.now().strftime("%Y-%m-%d %H:%M:%S,%f")[:-3]} - {message}')



# def get_mistral_API_key(llm_rag_folder:Path) -> str:
#     key_json_path = llm_rag_folder.joinpath('mistral_key.json')
#     with open(key_json_path, 'r') as f:
#         key_json = json.load(f)

#     return key_json['MISTRAL_API_KEY']