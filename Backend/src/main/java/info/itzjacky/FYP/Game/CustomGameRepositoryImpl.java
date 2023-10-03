package info.itzjacky.FYP.Game;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

public class CustomGameRepositoryImpl implements CustomGameRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Game> customFindGames(String name, List<Platform> platforms, List<GameGenre> genres) {

//        for each platforms in platform, add part of the sql query where p MEMBER OF g.platforms
//        if genre exist, add brackets around the genre part of the query

        StringBuilder query = new StringBuilder("SELECT g FROM Game g WHERE ");

        if (name != null) {
            query.append(" (g.name LIKE '%").append(name).append("%') AND ");
        }


        query.append("(");

        if( platforms !=null && platforms.size() > 0) {
            for (int i = 0; i < platforms.size(); i++) {
                query.append('"' +platforms.get(i).name() + '"').append(" MEMBER OF g.platforms");
                if (i != platforms.size() - 1) {
                    query.append(" OR ");
                }
            }
        }
        query.append(")");
        if(genres.size() > 0) {
            query.append(" AND ");
        }
//        for each genres in genres, add part of the sql query where p MEMBER OF g.genre
//        first check if there are any platforms, if there are, add AND to the query
        for (int i = 0; i < genres.size(); i++) {
            query.append('"' +genres.get(i).name() + '"').append(" MEMBER OF g.genre");
            if (i != genres.size() - 1) {
                query.append(" OR ");
            }
        }
        System.out.println(query.toString());
        return (List<Game>) entityManager.createQuery(query.toString())
                .getResultList();
    }


}
