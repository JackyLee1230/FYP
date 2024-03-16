# keyword mapping from DB to Enum for Python

from enum import Enum

from _load_bertopic_models import GENRES

class GENRES_DB(Enum):
    ACTION_AND_ADVENTURE = 0
    CLASSICS = 1
    FAMILY_AND_KIDS = 2
    INDIE = 3
    PLATFORMER = 4
    PUZZLE = 5
    RPG = 6
    SHOOTER = 7
    SIMULATION = 8
    SPORTS = 9
    STRATEGY = 10
    RHYTHM = 11
    SURVIVAL = 12
    HORROR = 13
    MMO = 14
    MOBA = 15

# mapping from GENRES_DB to GENRE in _load_bertopic_models.py

GENRES_DB_TO_GENRE_BERTOPIC = {
    GENRES_DB.ACTION_AND_ADVENTURE: GENRES.ACTION,
    GENRES_DB.INDIE: GENRES.INDIE,
}