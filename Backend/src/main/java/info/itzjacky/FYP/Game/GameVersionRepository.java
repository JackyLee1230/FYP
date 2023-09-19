package info.itzjacky.FYP.Game;

import info.itzjacky.FYP.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface GameVersionRepository extends JpaRepository<GameVersion,Integer>{

    GameVersion findGameVersionById(Integer id);

    List<GameVersion> findGameVersionsByVersionedGame(Game game);

    List<GameVersion> findGameVersionsByVersionedGameOrderByCreatedAtDesc(Game game);
}


