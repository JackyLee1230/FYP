from enum import Enum
import pandas as pd

from pathlib import Path

class GENRES(Enum):
    # to get the name of the genre
    # lower case all the letters
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


def load_dataset(genre:GENRES, dataset_folder:Path = None):
    # dataset_folder = Path('../../dataset/topic_modelling/top_11_genres').resolve()
    if dataset_folder is None:
        raise ValueError('Please provide the dataset folder')

    _dataset_folder = dataset_folder.resolve()
    if not _dataset_folder.exists():
        raise FileNotFoundError(f'{_dataset_folder} does not exist')
    

    # load the dataset
    _dataset_path = _dataset_folder.joinpath(
        f'{genre.value:02}_{str(genre)}.pkl'
    )

    print('Load dataset from:', _dataset_path)
    print('\n\n')

    dataset = pd.read_pickle(_dataset_path)

    return dataset, _dataset_path


if __name__ == '__main__':
    dataset = load_dataset(GENRES.ACTION)
    print(dataset.head())