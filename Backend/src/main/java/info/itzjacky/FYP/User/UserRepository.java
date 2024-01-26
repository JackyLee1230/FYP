package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.CustomGameRepository;
import info.itzjacky.FYP.Game.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User,Integer>, CustomUserRepository {

    User findUserById(Integer id);

    User findUserByName(String name);

//    find all developers that developed a game
    @Query("SELECT u FROM User u WHERE u.developedGames = ?1")
    Optional<User> findDevelopersByGame(Game game);

    User findUserByEmail(String email);

    User findUserByResetPasswordToken(String resetPasswordToken);

    User findUserByVerificationToken(String verificationToken);

    User findUserByEmailOrName(String email, String name);
}
