package info.itzjacky.FYP.Game;

import java.util.List;

public interface CustomGameRepository {
    List<Game> customFindGames(String name, List<Platform> platform, List<GameGenre> genre);

    List<Game> top10MostReviewedGames();
}
