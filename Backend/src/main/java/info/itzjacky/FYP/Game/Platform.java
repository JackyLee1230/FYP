package info.itzjacky.FYP.Game;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public enum Platform {
    STEAM(0),
    MAC(1),
    GOG(2),
    EPIC_GAMES(3),
    ORIGIN(4),
    NINTENDO_SWITCH(5),
    NINTENDO_3DS(6),
    NINTENDO_DS(7),
    NINTENDO_WII(8),
    NINTENDO_WII_U(9),
    NINTENDO_GAMECUBE(10),
    NINTENDO_64(11),
    NINTENDO_GAMEBOY(12),
    NINTENDO_GAMEBOY_ADVANCE(13),
    NINTENDO_GAMEBOY_COLOR(14),
    NINTENDO_GAME_AND_WATCH(15),
    NINTENDO_ENTERTAINMENT_SYSTEM(16),
    NINTENDO_SUPER_NINTENDO(17),
    PS1(18),
    PS2(19),
    PS3(20),
    PS4(21),
    PS5(22),
    XBOX(23),
    XBOX_360(24),
    XBOX_ONE(25),
    XBOX_SERIES(26),
    ;

    private int id;

    Platform(int id){
        this.id = id;
    }

    public int getID(){
        return id;
    }

//    a function to return all the values of the enum
    public static List<Map<String, Integer>> getAllPlatforms() {
        ArrayList<Map<String, Integer>> returnedList = new ArrayList<Map<String, Integer>>();
        for (Platform p : Platform.values()) {
            Map <String, Integer> tmp = new HashMap<>();
            tmp.put(p.toString(), p.getID());
            returnedList.add(tmp);
        }
        return returnedList;
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
