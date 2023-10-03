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

    List<Review> findReviewsByReviewer(User user);

    List<Review> findReviewsByReviewerId(Integer id);

    List<Review> findReviewsByReviewerName(String name);

    @Query("SELECT count(r) FROM Review r WHERE r.sentiment = 1 and r.reviewedGame.id = ?1")
    Integer countDistinctByPositiveSentiment(Integer gameId);

    @Query("SELECT count(r) FROM Review r WHERE r.sentiment = -1 and r.reviewedGame.id = ?1")
    Integer countDistinctByNegativeSentiment(Integer gameId);

    @Query("SELECT avg(r.score) FROM Review r WHERE r.reviewedGame.id = ?1")
    Integer avgScoreByGameId(Integer gameId);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.name = ?1")
    List<Review> findReviewByGameName(String gameName);


    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1")
    List<Review> findReviewsByGameId(Integer gameId);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 ORDER BY r.score DESC")
    List<Review> findReviewsByGameIdOrderByScore(Integer gameId);

//    find top 5 most recent reviews
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findMostRecentReviews(PageRequest limit);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 AND r.gameVersion = ?2")
    List<Review> findReviewsByIdAndGameVersion(Integer id, String gameVersion);
}
