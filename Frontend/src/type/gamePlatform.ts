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
  NINTENDO_GAME_AND_WATCH = "Nintendo Game & Watch",
  NINTENDO_ENTERTAINMENT_SYSTEM = "Nintendo Entertainment System",
  NINTENDO_SUPER_NINTENDO = "Super Nintendo",
  NINTENDO_DS = "Nintendo DS",
  NINTENDO_3DS = "Nintendo 3DS",
  MOBILE = "Mobile",
  APPLE_ARCADE = "Apple Arcade",
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

export const PlatformList = [
  "STEAM",
  "MAC",
  "GOG",
  "EPIC_GAMES",
  "ORIGIN",
  "NINTENDO_SWITCH",
  "NINTENDO_3DS",
  "NINTENDO_DS",
  "NINTENDO_WII",
  "NINTENDO_WII_U",
  "NINTENDO_GAMECUBE",
  "NINTENDO_64",
  "NINTENDO_GAMEBOY",
  "NINTENDO_GAMEBOY_ADVANCE",
  "NINTENDO_GAMEBOY_COLOR",
  "NINTENDO_GAME_AND_WATCH",
  "NINTENDO_ENTERTAINMENT_SYSTEM",
  "NINTENDO_SUPER_NINTENDO",
  "PS1",
  "PS2",
  "PS3",
  "PS4",
  "PS5",
  "XBOX",
  "XBOX_360",
  "XBOX_ONE",
  "XBOX_SERIES",
  "MOBILE",
  "APPLE_ARCADE",
];

export enum PlatformById {
  STEAM = 0,
  MAC = 1,
  GOG = 2,
  EPIC_GAMES = 3,
  ORIGIN = 4,
  NINTENDO_SWITCH = 5,
  NINTENDO_3DS = 6,
  NINTENDO_DS = 7,
  NINTENDO_WII = 8,
  NINTENDO_WII_U = 9,
  NINTENDO_GAMECUBE = 10,
  NINTENDO_64 = 11,
  NINTENDO_GAMEBOY = 12,
  NINTENDO_GAMEBOY_ADVANCE = 13,
  NINTENDO_GAMEBOY_COLOR = 14,
  NINTENDO_GAME_AND_WATCH = 15,
  NINTENDO_ENTERTAINMENT_SYSTEM = 16,
  NINTENDO_SUPER_NINTENDO = 17,
  PS1 = 18,
  PS2 = 19,
  PS3 = 20,
  PS4 = 21,
  PS5 = 22,
  XBOX = 23,
  XBOX_360 = 24,
  XBOX_ONE = 25,
  XBOX_SERIES = 26,
  MOBILE = 27,
  APPLE_ARCADE = 28,
}

export function getIdByPlatform(key: string): number {
  return PlatformById[key as keyof typeof PlatformById];
}

export default Platform;

