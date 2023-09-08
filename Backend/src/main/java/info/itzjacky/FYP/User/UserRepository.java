package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User,Integer>{

    Optional<User> findUserById(Integer id);

    Optional<User> findUserByName(String name);

//    find all developers that developed a game
    @Query("SELECT u FROM User u WHERE u.developedGames = ?1")
    Optional<User> findDevelopersByGame(Game game);


    Optional<User> findUserByEmail(String email);
}
