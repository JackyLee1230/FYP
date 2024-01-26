package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.CustomGameRepository;
import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameGenre;
import info.itzjacky.FYP.Game.Platform;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class CustomUserRepositoryImpl implements CustomUserRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<List<Integer>> findMostFavouritedGames(Integer numOfGames) {
        StringBuilder query = new StringBuilder();
        query.append("select g, count(u.id) from User u join u.favouriteGames g group by g order by count(u.id) desc limit " + numOfGames);
        return entityManager.createQuery(query.toString()).setMaxResults(numOfGames).getResultList();
    }


    @Override
    public List<List<Integer>> findMostWishlistedGames(Integer numOfGames) {
        StringBuilder query = new StringBuilder();
        query.append("select g, count(u.id) from User u join u.favouriteGames g group by g order by count(u.id) desc limit " + numOfGames);
        return entityManager.createQuery(query.toString()).setMaxResults(numOfGames).getResultList();
    }


}
