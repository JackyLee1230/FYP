package info.itzjacky.FYP.Game;

import java.util.ArrayList;
import java.util.List;

public enum Platform {
    STEAM,
    MAC,
    GOG,
    EPIC_GAMES,
    ORIGIN,


    NINTENDO_SWITCH,
    NINTENDO_3DS,
    NINTENDO_DS,
    NINTENDO_WII,
    NINTENDO_WII_U,
    NINTENDO_GAMECUBE,
    NINTENDO_64,
    NINTENDO_GAMEBOY,
    NINTENDO_GAMEBOY_ADVANCE,
    NINTENDO_GAMEBOY_COLOR,
    NINTENDO_GAME_AND_WATCH,
    NINTENDO_ENTERTAINMENT_SYSTEM,
    NINTENDO_SUPER_NINTENDO,


    PS1,
    PS2,
    PS3,
    PS4,
    PS5,


    XBOX,
    XBOX_360,
    XBOX_ONE,
    XBOX_SERIES,

    ;

//    a function to return all the values of the enum
    public static List<Platform> getAllPlatforms() {
        return List.of(Platform.values());
    }

    public static List<Platform> getPlatformFromString(String platform) {
        ArrayList<Platform> returnedList = new ArrayList<Platform>();
        platform = platform.replace("_", "");
        for (Platform p : Platform.values()) {
            if (p.toString().replace("_","").toLowerCase().contains(platform.toLowerCase())) {
                returnedList.add(p);
            }
        }
        return returnedList.isEmpty() ? null : returnedList;
    }

}
