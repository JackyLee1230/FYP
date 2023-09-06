package info.itzjacky.FYP.Repository;

import info.itzjacky.FYP.Entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface GameRepository extends JpaRepository<Game,Integer>{

    Optional<Game> findGameById(Integer id);

    @Query("SELECT g FROM Game g WHERE g.developer = ?1")
    Optional<Game> findGamesByDeveloper(String developer);

    Optional<Game> findGameByNameAndDeveloper(String name, String developer);
}
