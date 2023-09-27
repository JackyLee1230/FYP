package info.itzjacky.FYP.Game;

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
    MMO;

//    a function to return all the values of the enum
    public static List<GameGenre> getAllGenres() {
        return List.of(GameGenre.values());
    }

}
