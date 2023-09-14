package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.User.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ReviewRepository extends JpaRepository<Review,Integer>{

    Review findReviewById(Integer id);

    Optional<Review> findReviewsByReviewer(User user);

    List<Review> findReviewByReviewerName(String name);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.name = ?1")
    List<Review> findReviewByGameName(String gameName);


    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1")
    List<Review> findReviewByGameId(Integer gameId);

//    find top 5 most recent reviews
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findMostRecentReviews(PageRequest limit);
}
