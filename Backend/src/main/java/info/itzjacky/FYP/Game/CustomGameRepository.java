package info.itzjacky.FYP.Game;

import java.util.List;

public interface CustomGameRepository {
    List<Game> customFindGames(String name, List<Platform> platform, List<GameGenre> genre, Boolean isInDevelopment, Boolean orderedByScore, Boolean orderedByReleaseDate);

    List<Game> customFindGamesDeveloper(String developer, List<Platform> platform, List<GameGenre> genre, Boolean isInDevelopment, Boolean orderedByScore, Boolean orderedByReleaseDate);

    List<Game> topMostReviewedGames(Integer numOfGames);

    List<Game> topRecentlyReleasedGames(Integer numOfGames);

    List<Game> topMostReviewedInDevelopmentGame(Integer numOfGames);
}
