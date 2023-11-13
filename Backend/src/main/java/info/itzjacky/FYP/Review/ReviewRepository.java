package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.User.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1")
    Page<Review> fidnReviewsByReviewerIdPaged(Integer id, Pageable pageable);

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

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1")
    Page<Review> findReviewsByGameIdPaged(Integer gameId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 and r.sentiment = ?2")
    List<Review> findReviewsByGameIdAndSentiment(Integer gameId, Integer sentiment);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 and r.recommended = ?2")
    List<Review> findReviewsByGameIdAndRecommended(Integer gameId, Boolean recommended);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 and r.sentiment = ?2 and r.recommended = ?3")
    List<Review> findReviewsByGameIdAndSentimentAndRecommended(Integer gameId, Integer sentiment, Boolean recommended);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 ORDER BY r.score DESC")
    List<Review> findReviewsByGameIdOrderByScore(Integer gameId);

//    find top 5 most recent reviews
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findMostRecentReviews(PageRequest limit);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 AND r.gameVersion = ?2")
    List<Review> findReviewsByIdAndGameVersion(Integer id, String gameVersion);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 AND r.gameVersion = ?2 and r.sentiment = ?3")
    List<Review> findReviewsByIdAndGameVersionAndSentiment(Integer id, String gameVersion, Integer sentiment);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 AND r.gameVersion = ?2 and r.recommended = ?3")
    List<Review> findReviewsByIdAndGameVersionAndRecommended(Integer id, String gameVersion, Boolean recommended);

    @Query("SELECT r FROM Review r WHERE r.reviewedGame.id = ?1 AND r.gameVersion = ?2 and r.recommended = ?3")
    List<Review> findReviewsByIdAndGameVersionAndSentimentAndRecommended(Integer id, String gameVersion,Integer sentiment, Boolean recommended);


}
