package info.itzjacky.FYP.Game;

import java.util.ArrayList;
import java.util.List;

public enum GameGenre {
    ACTION_AND_ADVENTURE,
    CLASSICS,
    FAMILY_AND_KIDS,
    INDIE,
    PLATFORMER,
    PUZZLE,
    RPG,
    SHOOTER,
    SIMULATION,
    SPORTS,
    STRATEGY,
    RHYTHM,
    SURVIVAL,
    HORROR,
    MMO,
    MOBA;

//    a function to return all the values of the enum
    public static List<GameGenre> getAllGenres() {
        return List.of(GameGenre.values());
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
