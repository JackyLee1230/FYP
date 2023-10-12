package info.itzjacky.FYP.Game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public enum GameGenre {
    ACTION_AND_ADVENTURE(0),
    CLASSICS(1),
    FAMILY_AND_KIDS(2),
    INDIE(3),
    PLATFORMER(4),
    PUZZLE(5),
    RPG(6),
    SHOOTER(7),
    SIMULATION(8),
    SPORTS(9),
    STRATEGY(10),
    RHYTHM(11),
    SURVIVAL(12),
    HORROR(13),
    MMO(14),
    MOBA(15);

    private int id;

    GameGenre(int id){
        this.id = id;
    }

    public int getID(){
        return id;
    }

    //    a function to return all the values of the enum
    public static List<Map<String, Integer>> getAllGenres() {
        ArrayList<Map<String, Integer>> returnedList = new ArrayList<Map<String, Integer>>();
        for (GameGenre g : GameGenre.values()) {
            Map <String, Integer> tmp = new HashMap<>();
            tmp.put(g.toString(), g.getID());
            returnedList.add(tmp);
        }
        return returnedList;
    }


//    write a function that takes a string to find any genre that contains the string, and remove any underscore in the enum and ignore case
    public static List<GameGenre> getGenreFromString(String genre) {
        ArrayList<GameGenre> returnedList = new ArrayList<GameGenre>();
        genre = genre.replace("_", "");
        for (GameGenre gameGenre : GameGenre.values()) {
            if (gameGenre.toString().replace("_", "").toLowerCase().contains(genre.toLowerCase())) {
                returnedList.add(gameGenre);
            }
        }
        return returnedList.isEmpty() ? null : returnedList;
    }
}
