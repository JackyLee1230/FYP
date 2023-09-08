package info.itzjacky.FYP.Repository;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Entity.Review;
import info.itzjacky.FYP.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ReviewRepository extends JpaRepository<Review,Integer>{

    Optional<Review> findReviewById(Integer id);

    Optional<Review> findReviewsByReviewer(User user);

    Optional<Review> findReviewByReviewerName(String name);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.name = ?1")
    List<Review> findReviewByGameName(String gameName);
}
