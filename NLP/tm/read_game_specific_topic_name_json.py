import json
from pathlib import Path

from _load_bertopic_models import GENRES, BERTOPIC_MODELS

def read_game_specific_topic_name_json(game_name:str, topic_model_dir:Path):
    '''Read the json file that contains the topic names for the specific game and topic name

    :param game_name: the name of the game
    :param topic_model_dir: the directory that contains the topic model

    return a list of strings, each string is a topic name
    '''

    _game_name = game_name
    _game_name = _game_name.replace(":", "")        # remove the colon in the game name

    _topic_model_dir = topic_model_dir.parts[-2:]
    _json_path = Path(
        "../NLP/tm",            # for the program to locate the parent folder of this project
        "game_specific_topic_name",
        f"{game_name}",
        *_topic_model_dir,
        "topic_id_to_label.json"
    )

    if not _json_path.exists():
        print(f"json file not found at {_json_path}")
        return None

    # read the json file
    with open(_json_path, "r") as f:
        topic_id_to_label_json = json.load(f)

        print(f"topic_id_to_label_json: {topic_id_to_label_json}")

    return topic_id_to_label_json

def read_model_specific_topic_name_json(topic_model_dir:Path):
    '''Read the json file that contains the topic names for the specific topic name

    :param topic_model_dir: the directory that contains the topic model

    return a list of strings, each string is a topic name
    '''

    _topic_model_dir = topic_model_dir.parts[-2:]
    _json_path = Path(
        "../NLP/tm",            # for the program to locate the parent folder of this project
        "model_specific_topic_name",
        *_topic_model_dir,
        "topic_id_to_label.json"
    )

    if not _json_path.exists():
        print(f"json file not found at {_json_path}")
        return None

    # read the json file
    with open(_json_path, "r") as f:
        topic_id_to_label_json = json.load(f)

        # print(f"topic_id_to_label_json: {topic_id_to_label_json}")

    return topic_id_to_label_json



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

SPECIFIC_TOPIC_NAME_DICT = {
    # (SPECIFIC_TOPIC_NAME_GAMES[0], GENRES.ACTION, 10): read_game_specific_topic_name_json(SPECIFIC_TOPIC_NAME_GAMES[0], BERTOPIC_MODELS[(GENRES.ACTION, 10)][0]),
    # (SPECIFIC_TOPIC_NAME_GAMES[1], GENRES.ACTION, 10): read_game_specific_topic_name_json(SPECIFIC_TOPIC_NAME_GAMES[1], BERTOPIC_MODELS[(GENRES.ACTION, 10)][0]),
    # (SPECIFIC_TOPIC_NAME_GAMES[2], GENRES.ACTION, 10): read_game_specific_topic_name_json(SPECIFIC_TOPIC_NAME_GAMES[2], BERTOPIC_MODELS[(GENRES.ACTION, 10)][0]),
    # (SPECIFIC_TOPIC_NAME_GAMES[3], GENRES.ACTION, 10): read_game_specific_topic_name_json(SPECIFIC_TOPIC_NAME_GAMES[3], BERTOPIC_MODELS[(GENRES.ACTION, 10)][0]),

    # short-hand notation
    (game_name, GENRES.ACTION, 10): read_game_specific_topic_name_json(game_name, BERTOPIC_MODELS[(GENRES.ACTION, 10)][0]) for game_name in SPECIFIC_TOPIC_NAME_GAMES
}

MODEL_SPECIFIC_TOPIC_NAME_DICT = {
    (GENRES.ALL, 30): read_model_specific_topic_name_json(BERTOPIC_MODELS[(GENRES.ALL, 30)][0]),
    (GENRES.ACTION, 30): read_model_specific_topic_name_json(BERTOPIC_MODELS[(GENRES.ACTION, 30)][0]),
    (GENRES.INDIE, 30): read_model_specific_topic_name_json(BERTOPIC_MODELS[(GENRES.INDIE, 30)][0])
}
    