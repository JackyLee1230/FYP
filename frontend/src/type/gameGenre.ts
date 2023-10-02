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

export default Genre;

