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

export default Platform;

