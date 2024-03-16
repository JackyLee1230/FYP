from bertopic import BERTopic

from enum import Enum
from pathlib import Path
from datetime import datetime
from itertools import product

class GENRES(Enum):
    # to get the name of the genre
    # lower case all the letters
    # copied from dev-workspace/topic_modelling/bertopic_dev/...
    ALL = -1

    ACTION = 0
    INDIE = 1
    ADVENTURE = 2
    RPG = 3
    STRATEGY = 4
    SIMULATION = 5
    FREE_TO_PLAY = 6
    CASUAL = 7
    MASSIVELY_MULTIPLAYER = 8
    RACING = 9
    SPORTS = 10

    def __str__(self):
        return self.name.lower()
    

TRAINING_DATETIME_DICT = {
    GENRES.ALL: datetime(2024, 2, 23, 23, 37, 39),
    GENRES.ACTION: datetime(2024, 3, 1, 9, 51, 49),
    GENRES.INDIE: datetime(2024, 2, 14, 11, 15, 56),
}

def _load_bertopic_model(genre:GENRES, n_topics:int):

    training_datetime = TRAINING_DATETIME_DICT[genre]


    model_folder_path = Path(
        "../NLP/tm",
        f"bertopic[split]_{'genre_'+str(genre)+'_' if genre.value >= 0 else ''}grid_search_{training_datetime.strftime('%Y%m%d_%H%M%S')}",
    )
    model_folder_path = model_folder_path.joinpath(f'bertopic_bt_nr_topics_{n_topics}')
    print('Loaded model from:', model_folder_path)

    bertopic_model = BERTopic.load(str(model_folder_path))

    return model_folder_path, bertopic_model


# cache bertopic models
# identify by the genre and the number of topics
BERTOPIC_MODELS_LIST = list(product([GENRES.ALL, GENRES.ACTION, GENRES.INDIE], [10, 30]))

# also used in loading game specfic topic name json
BERTOPIC_MODELS = {k: _load_bertopic_model(k[0], k[1]) for k in BERTOPIC_MODELS_LIST}