package info.itzjacky.FYP.User;

import java.util.List;

public interface CustomUserRepository {

    List<List<Integer>> findMostFavouritedGames(Integer numOfGames);

    List<List<Integer>> findMostWishlistedGames(Integer numOfGames);
}