package info.itzjacky.FYP.Game;

import info.itzjacky.FYP.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface GameRepository extends JpaRepository<Game,Integer>{

    Game findGameById(Integer id);

    @Query("SELECT g FROM Game g WHERE g.developerCompany LIKE %:developerCompany%")
    List<Game> findGamesByDeveloperCompany(String developerCompany);

    @Query("SELECT g FROM Game g WHERE g.developers = ?1")
    Optional<Game> findGamesByDeveloper(User developer);

//    Optional<Game> findGameByNameAndDevelopers(String name, List<User> developer);

    Optional<Game> findGameByNameAndAndDeveloperCompany(String name, String developerCompany);

    @Query("SELECT g FROM Game g WHERE g.name LIKE %:name%")
    List<Game> findGamesByName(String name);
}


