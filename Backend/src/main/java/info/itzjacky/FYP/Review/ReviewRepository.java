package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.User.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ReviewRepository extends JpaRepository<Review,Integer>{

    Review findReviewById(Integer id);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 and r.game_id = ?2")
    Review findReviewByReviewerAndReviewedGame(Integer reviewer, Integer reviewedGame);

//    find top N (parameter) most liked review (review_likes) where review_likes.review_id = review.id order by the number of likes
    @Query(nativeQuery = true, value = "SELECT * FROM review r order by (SELECT count(*) FROM review_likes l WHERE l.review_id = r.id) desc limit ?1")
    List<Review> findMostLikedReviews(Integer limit);

    List<Review> findReviewsByReviewer(User user);

    List<Review> findReviewsByReviewerId(Integer id);

    @Query(nativeQuery = true, value = "SELECT count(*) FROM review_likes r WHERE r.review_id = ?1")
    Integer countLikesByReviewId(Integer id);

    @Query(nativeQuery = true, value = "SELECT count(*) FROM review_dislikes r WHERE r.review_id = ?1")
    Integer countDislikesByReviewId(Integer id);

    @Query(nativeQuery = true, value = "SELECT count(*) FROM review_comment r WHERE r.review_id = ?1")
    Integer countCommentsByReviewId(Integer id);

    @Query(nativeQuery = true, value = "SELECT r.user_id FROM review_likes r WHERE r.review_id = ?1")
    List<Integer> findLikedUsersByReviewId(Integer id);

    @Query(nativeQuery = true, value = "SELECT r.user_id FROM review_dislikes r WHERE r.review_id = ?1")
    List<Integer> findDislikedUsersByReviewId(Integer id);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1")
    Page<Review> fidnReviewsByReviewerIdPaged(Integer id, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 order by r.created_at desc")
    Page<Review> findReviewsByReviewerIdPagedSortByCreatedAt(Integer id, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 order by r.created_at asc")
    Page<Review> findReviewsByReviewerIdPagedSortByCreatedAtAsc(Integer id, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 order by r.score desc")
    Page<Review> findReviewsByReviewerIdPagedSortByScore(Integer id, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 order by r.score asc")
    Page<Review> findReviewsByReviewerIdPagedSortByScoreAsc(Integer id, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 and r.recommended = ?2 order by r.created_at desc")
    Page<Review> findReviewsByReviewerIdAndRecommendedPagedSortByCreatedAt(Integer id, Boolean Recommended, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 and r.recommended = ?2 order by r.created_at asc")
    Page<Review> findReviewsByReviewerIdAndRecommendedPagedSortByCreatedAtAsc(Integer id, Boolean Recommended, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 and r.recommended = ?2 order by r.score desc")
    Page<Review> findReviewsByReviewerIdAndRecommendedPagedSortByScore(Integer id, Boolean Recommended, Pageable pageable);

    @Query(nativeQuery = true,  value = "SELECT * FROM review r WHERE r.reviewer_id = ?1 and r.recommended = ?2 order by r.score asc")
    Page<Review> findReviewsByReviewerIdAndRecommendedPagedSortByScoreAsc(Integer id, Boolean Recommended, Pageable pageable);

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

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 order by r.created_at desc")
    Page<Review> findReviewsByGameIdPagedSortByCreatedAt(Integer gameId, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 and (r.is_spam = false or r.is_spam is null) order by r.created_at desc")
    Page<Review> findReviewsByGameIdPagedSpamFilteredSortByCreatedAt(Integer gameId, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 order by r.score desc")
    Page<Review> findReviewsByGameIdPagedSortByScore(Integer gameId, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 and (r.is_spam = false or r.is_spam is null) order by r.score desc")
    Page<Review> findReviewsByGameIdPagedSpamFilteredSortByScore(Integer gameId, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 and r.recommended = ?2 order by r.created_at desc")
    Page<Review> findReviewsByGameIdAndRecommendedPagedSortByCreatedAt(Integer gameId, Boolean Recommended, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 and r.recommended = ?2 and (r.is_spam = false or r.is_spam is null) order by r.created_at desc")
    Page<Review> findReviewsByGameIdAndRecommendedPagedSpamFilteredSortByCreatedAt(Integer gameId, Boolean Recommended, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 and r.recommended = ?2 order by r.score desc")
    Page<Review> findReviewsByGameIdAndRecommendedPagedSortByScore(Integer gameId, Boolean Recommended, Pageable pageable);

    @Query(nativeQuery = true, value = "SELECT * FROM review r WHERE r.game_id = ?1 and r.recommended = ?2 and (r.is_spam = false or r.is_spam is null) order by r.score desc")
    Page<Review> findReviewsByGameIdAndRecommendedPagedSpamFilteredSortByScore(Integer gameId, Boolean Recommended, Pageable pageable);

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
