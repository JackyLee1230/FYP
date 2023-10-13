enum Genre {
  ACTION_AND_ADVENTURE = "Action & Adventure",
  CLASSICS = "Classics",
  FAMILY_AND_KIDS = "Family & Kids",
  INDIE = "Indie",
  PLATFORMER = "Platformer",
  PUZZLE = "Puzzle",
  RPG = "RPG",
  SHOOTER = "Shooter",
  SIMULATION = "Simulation",
  SPORTS = "Sports",
  STRATEGY = "Strategy",
  RHYTHM = "Rhythm",
  SURVIVAL = "Survival",
  HORROR = "Horror",
  MMO = "MMO",
  MOBA = "MOBA",
}

export function getGenre(key: string): string {
  return Genre[key as keyof typeof Genre];
}

export const GenreList = ["ACTION_AND_ADVENTURE", "CLASSICS", "FAMILY_AND_KIDS", "INDIE", "PLATFORMER", "PUZZLE", "RPG", "SHOOTER", "SIMULATION", "SPORTS", "STRATEGY", "RHYTHM", "SURVIVAL", "HORROR", "MMO", "MOBA"]

export enum GenreById {
  ACTION_AND_ADVENTURE = 0,
  CLASSICS = 1,
  FAMILY_AND_KIDS = 2,
  INDIE = 3,
  PLATFORMER = 4,
  PUZZLE = 5,
  RPG = 6,
  SHOOTER = 7,
  SIMULATION = 8,
  SPORTS = 9,
  STRATEGY = 10,
  RHYTHM = 11,
  SURVIVAL = 12,
  HORROR = 13,
  MMO = 14,
  MOBA = 15,
}

export default Genre;