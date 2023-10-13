enum Platform {
  PS1 = "PlayStation 1",
  PS2 = "PlayStation 2",
  PS3 = "PlayStation 3",
  PS4 = "PlayStation 4",
  PS5 = "PlayStation 5",
  XBOX = "Xbox",
  XBOX_360 = "Xbox 360",
  XBOX_ONE = "Xbox One",
  XBOX_SERIES = "Xbox Series X/S",
  STEAM = "Steam",
  GOG = "GOG",
  ORIGIN = "Origin",
  MAC = "Mac",
  EPIC_GAMES = "Epic Games",
  NINTENDO_64 = "Nintendo 64",
  NINTENDO_GAMECUBE = "Nintendo GameCube",
  NINTENDO_WII = "Nintendo Wii",
  NINTENDO_WII_U = "Nintendo Wii U",
  NINTENDO_SWITCH = "Nintendo Switch",
  NINTENDO_GAMEBOY = "Nintendo Gameboy",
  NINTENDO_GAMEBOY_ADVANCE = "Nintendo Gameboy Advance",
  NINTENDO_GAMEBOY_COLOR = "Nintendo Gameboy Color",
  NINTENDO_DS = "Nintendo DS",
  NINTENDO_3DS = "Nintendo 3DS",
}

export function getPlatform(key: string): string {
  return Platform[key as keyof typeof Platform];
}

export function getPlatformKey(value: string): string {
  return (
    Object.keys(Platform).find(
      (key) => Platform[key as keyof typeof Platform] === value
    ) || ""
  );
}

export const PlatformList = ["PS1", "PS2", "PS3", "PS4", "PS5", "XBOX", "XBOX_360", "XBOX_ONE", "XBOX_SERIES", "STEAM", "GOG", "ORIGIN", "MAC", "EPIC_GAMES", "NINTENDO_64", "NINTENDO_GAMECUBE", "NINTENDO_WII", "NINTENDO_WII_U", "NINTENDO_SWITCH", "NINTENDO_GAMEBOY", "NINTENDO_GAMEBOY_ADVANCE", "NINTENDO_GAMEBOY_COLOR", "NINTENDO_DS", "NINTENDO_3DS"]

export enum PlatformById {
  PS1 = 0,
  PS2 = 1,
  PS3 = 2,
  PS4 = 3,
  PS5 = 4,
  XBOX = 5,
  XBOX_360 = 6,
  XBOX_ONE = 7,
  XBOX_SERIES = 8,
  STEAM = 9,
  GOG = 10,
  ORIGIN = 11,
  MAC = 12,
  EPIC_GAMES = 13,
  NINTENDO_64 = 14,
  NINTENDO_GAMECUBE = 15,
  NINTENDO_WII = 16,
  NINTENDO_WII_U = 17,
  NINTENDO_SWITCH = 18,
  NINTENDO_GAMEBOY = 19,
  NINTENDO_GAMEBOY_ADVANCE = 20,
  NINTENDO_GAMEBOY_COLOR = 21,
  NINTENDO_DS = 22,
  NINTENDO_3DS = 23,
}

export default Platform;

