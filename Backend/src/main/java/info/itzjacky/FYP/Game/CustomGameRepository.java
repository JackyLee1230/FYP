package info.itzjacky.FYP.Game;

import java.util.List;

public interface CustomGameRepository {
    List<Game> customFindGames(List<Platform> platform, List<GameGenre> genre);
}
