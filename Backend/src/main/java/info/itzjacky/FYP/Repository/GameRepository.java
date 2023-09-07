package info.itzjacky.FYP.Repository;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface GameRepository extends JpaRepository<Game,Integer>{

    Optional<Game> findGameById(Integer id);

    @Query("SELECT g FROM Game g WHERE g.developers = ?1")
    Optional<Game> findGamesByDeveloper(User developer);

//    Optional<Game> findGameByNameAndDevelopers(String name, List<User> developer);
}
