package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameRepository;
import info.itzjacky.FYP.Game.GameVersion;
import info.itzjacky.FYP.Game.Platform;
import info.itzjacky.FYP.RabbitMQ.RabbitMQProducer;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserRepository;
import info.itzjacky.FYP.Utils.Others;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.util.concurrent.ExecutionException;

import static info.itzjacky.FYP.Utils.Others.booleanToInt;
import static info.itzjacky.FYP.Utils.Others.intToBoolean;

@Service
public class ReviewService {

    @Autowired
    private Environment env;

    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    ReviewCommentRepository reviewCommentRepository;

    Logger logger = LoggerFactory.getLogger(ReviewService.class);
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    @Transactional
    public List<Review> getAllReviews(){
        return reviewRepository.findAll();
    }

    @Transactional
    public void sentimentAnalysisForReview(ReviewRequest reviewReq) throws IOException, ExecutionException, InterruptedException {
        logger.info("Sentiment Analysis SENT to Python! ReviewId:" + reviewReq.getReviewId() + " Comment:" + reviewReq.getComment());
        String toBeSentToPython = String.format("%s;%s", reviewReq.getReviewId(), reviewReq.getComment());
        rabbitMQProducer.sendMessagetoRabbitMQ(toBeSentToPython);
//        Runtime rt = Runtime.getRuntime();
//        Review review = reviewRepository.findReviewById(reviewReq.getReviewId());
//        logger.info("Running Sentiment Analysis Script! ReviewId:" + review.getId() + " Comment:" + review.getComment());
//        try {
//            ProcessBuilder pb = new ProcessBuilder("python", env.getProperty("SENTIMENT_ANALYSIS_SCRIPT_PATH"), review.getComment());
//            pb.redirectErrorStream(true);
//            Process extractProcess = pb.start();
//            StringBuilder programOutput = new StringBuilder();
//            try (BufferedReader processOutputReader = new BufferedReader(
//                    new InputStreamReader(extractProcess.getInputStream()));)
//            {
//                String readLine;
//                while ((readLine = processOutputReader.readLine()) != null)
//                {
//                    programOutput.append(readLine).append(System.lineSeparator());
//                }
//                extractProcess.waitFor();
//            }
//            review.setSentiment(Integer.parseInt(programOutput.toString().trim()));
//            review.setSentimentUpdatedAt(new java.sql.Date(System.currentTimeMillis()));
//            return Integer.parseInt(programOutput.toString().trim());
//        } catch (IOException | InterruptedException e) {
//            throw new IllegalStateException("Sentiment Analysis Failed! " + e.getMessage());
//        }
    }


    public ReviewComment addReviewComment(ReviewCommentRequest reviewCommentRequest){
        if(reviewCommentRequest.getComment().isEmpty() || reviewCommentRequest.getCommenterId() == null || reviewCommentRequest.getReviewId() == null){
            throw new IllegalStateException("Cannot create Incomplete Review Comment");
        }
        try{
            ReviewComment reviewComment = ReviewComment.builder().commenter(userRepository.findUserById(reviewCommentRequest.getCommenterId()))
                    .review(reviewRepository.findReviewById(reviewCommentRequest.getReviewId()))
                    .comment(reviewCommentRequest.getComment())
                    .build();
            reviewCommentRepository.save(reviewComment);
            return reviewComment;
        } catch (Exception e){
            throw new IllegalStateException("Cannot create Review Comment");
        }
    }

    public Object reaction(ReviewRequest reviewRequest) {
        if (reviewRequest.getLikerId() == null || reviewRequest.getReviewId() == null) {
            throw new IllegalStateException("Cannot like/dislike review");
        }
//        make a map with like=false and dislike= false
        HashMap<String, Boolean> reactionMap = new HashMap<String, Boolean>();
        reactionMap.put("like", false);
        reactionMap.put("dislike", false);

        try {
            Review review = reviewRepository.findReviewById(reviewRequest.getReviewId());
            User liker = userRepository.findUserById(reviewRequest.getLikerId());
            if (review == null || liker == null) {
                throw new IllegalStateException("Cannot like/dislike review");
            }
            if(Reaction.LIKE.equals(reviewRequest.getReaction())){
                if (review.getLikes().contains(liker)) { // already liked
                    logger.info("already liked");
                    List<User> newLikes = review.getLikes();
                    newLikes.remove(liker);
                    review.setLikes(newLikes);
//                    remove this review from the user's liked reviews
                    List<Review> newLikedReviews = liker.getLikedReviews();
                    newLikedReviews.remove(review);
                    liker.setLikedReviews(newLikedReviews);
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    return reactionMap;
                }
                else if (review.getDislikes().contains(liker)) {
                    logger.info("user change from dislike to like");
                    //                    user change from dislike to like
                    List<User> newLikes = review.getLikes();
                    newLikes.add(liker);
                    review.setLikes(newLikes);

                    List<User> newDislikes = review.getDislikes();
                    newDislikes.remove(liker);
                    review.setDislikes(newDislikes);
//                    remove this review from the user's liked reviews
                    List<Review> newLikedReviews = liker.getLikedReviews();
                    newLikedReviews.remove(review);
                    liker.setLikedReviews(newLikedReviews);
                    List<Review> newDislikedReviews = liker.getDislikedReviews();
                    newDislikedReviews.add(review);
                    liker.setDislikedReviews(newDislikedReviews);
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("like", true);
                    return reactionMap;
                }
                else { // new like
                    logger.info("new like");
                    review.getLikes().add(liker);
                    List<User> newLikes = review.getLikes();
                    newLikes.add(liker);
                    review.setLikes(newLikes);
//                    add this review to the user's liked reviews
                    List<Review> newLikedReviews = liker.getLikedReviews();
                    newLikedReviews.add(review);
                    liker.setLikedReviews(newLikedReviews);
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("like", true);
                    return reactionMap;
                }
            } else if(Reaction.DISLIKE.equals(reviewRequest.getReaction())) {
                if (review.getDislikes().contains(liker)) { // already disliked
                    logger.info("already disliked");
                    List<User> newDislikes = review.getDislikes();
                    newDislikes.remove(liker);
                    review.setDislikes(newDislikes);
//                    remove this review from the user's disliked reviews
                    List<Review> newDislikedReviews = liker.getDislikedReviews();
                    newDislikedReviews.remove(review);
                    liker.setDislikedReviews(newDislikedReviews);
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("dislike", false);
                    return reactionMap;
                }
                else if (review.getLikes().contains(liker)) {
                    logger.info("user change from like to dislike");
//                    user change from like to dislike
                    List<User> newLikes = review.getLikes();
                    newLikes.remove(liker);
                    review.setLikes(newLikes);

                    List<User> newDislikes = review.getDislikes();
                    newDislikes.add(liker);
                    review.setDislikes(newDislikes);
//                    remove this review from the user's liked reviews
                    List<Review> newLikedReviews = liker.getLikedReviews();
                    newLikedReviews.remove(review);
                    liker.setLikedReviews(newLikedReviews);
                    List<Review> newDislikedReviews = liker.getDislikedReviews();
                    newDislikedReviews.add(review);
                    liker.setDislikedReviews(newDislikedReviews);
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("dislike", true);
                    return reactionMap;
                }
                else { // new dislike
                    logger.info("new dislike");
                    List<User> newDislikes = review.getDislikes();
                    newDislikes.add(liker);
                    review.setDislikes(newDislikes);
//                    add this review to the user's disliked reviews
                    List<Review> newDislikedReviews = liker.getDislikedReviews();
                    newDislikedReviews.add(review);
                    liker.setDislikedReviews(newDislikedReviews);
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("dislike", true);
                    return reactionMap;
                }
            }

        } catch (Exception e) {
            throw new IllegalStateException("Cannot like/dislike review");
        }
        return null;
    }


    public List<ReviewComment> getAllReviewCommentsById(ReviewCommentRequest reviewCommentRequest){
        try {
            return reviewCommentRepository.findReviewCommentsByReview(reviewRepository.findReviewById(reviewCommentRequest.getReviewId()));
        } catch (Exception e){
            throw new IllegalStateException("Cannot get Review Comments");
        }
    }

    public Review findReviewById(ReviewRequest reviewRequest){
        try {
            return reviewRepository.findReviewById(reviewRequest.getReviewId());
        } catch (Exception e){
            throw new IllegalStateException("Cannot get Review");
        }
    }

    public List<Review> findReviewsByGameId(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getGameId() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        return reviewRepository.findReviewsByGameId(reviewRequest.getGameId());
    }

    public Page<Review> findReviewsByGameIdPaged(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getGameId() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        if(reviewRequest.getReviewsPerPage() == null || reviewRequest.getReviewsPerPage() < 0 ){
            reviewRequest.setReviewsPerPage(5);
        }
        if(reviewRequest.getPageNum() == null || reviewRequest.getPageNum() < 0 ){
            reviewRequest.setPageNum(0);
        }
        // check sort by must be either "score" or "recency"
        if (reviewRequest.getSortBy() == null || (!reviewRequest.getSortBy().equals("score") && !reviewRequest.getSortBy().equals("recency"))) {
            reviewRequest.setSortBy("recency");
        }
        if (reviewRequest.getRecommended() == null) {
            Page<Review> r = null;
            if (Objects.equals(reviewRequest.getSortBy(), "recency")){
                r = reviewRepository.findReviewsByGameIdPagedSortByCreatedAt(reviewRequest.getGameId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
            } else {
                r = reviewRepository.findReviewsByGameIdPagedSortByScore(reviewRequest.getGameId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
            }

            for (Review review : r.getContent()){
                review.getReviewer().setReviews(null);
                review.setReviewedGame(null);
            }
            return r;
        } else {
            Page<Review> r = null;
            if (Objects.equals(reviewRequest.getSortBy(), "recency")) {
                r =  reviewRepository.findReviewsByGameIdAndRecommendedPagedSortByCreatedAt(reviewRequest.getGameId(),reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
            }
            else {
                r = reviewRepository.findReviewsByGameIdAndRecommendedPagedSortByScore(reviewRequest.getGameId(),reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
            }

            for (Review review : r.getContent()){
                review.getReviewer().setReviews(null);
                review.setReviewedGame(null);
            }
            return r;
        }
    }

    public Page<Review> findReviewsByGameIdAndRecommendedPaged(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getGameId() == null || reviewRequest.getRecommended() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        if(reviewRequest.getReviewsPerPage() == null || reviewRequest.getReviewsPerPage() < 0 ){
            reviewRequest.setReviewsPerPage(5);
        }
        if(reviewRequest.getPageNum() == null || reviewRequest.getPageNum() < 0 ){
            reviewRequest.setPageNum(0);
        }
        Page<Review> r = reviewRepository.findReviewsByGameIdAndRecommendedPagedSortByCreatedAt(reviewRequest.getGameId(),reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
        for (Review review : r.getContent()){
            review.getReviewer().setReviews(null);
            review.setReviewedGame(null);
        }
        return r;
    }

    public List<Review> getReviewsByReviewerId(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getReviewerId() == null){
            throw new IllegalStateException("Reviewer ID Cannot Be Empty/Null");
        }
        return reviewRepository.findReviewsByReviewerId(reviewRequest.getReviewId());
    }

    @Transactional
    public Review addReview(Review review){
        try{
            reviewRepository.save(review);
            Game game = review.getReviewedGame();
            List<Review> reviews = reviewRepository.findReviewsByGameId(game.getId());
            float totalScore = 0;
            for(Review r : reviews){
                totalScore += r.getScore();
            }
            game.setScore(totalScore/reviews.size());
            gameRepository.save(game);
            return review;
        }catch (Exception e){
            return null;
        }
    }

    @Transactional
    public Float updateScoreOfGameByReview(Integer gameId){
        List<Review> reviews = reviewRepository.findReviewsByGameId(gameId);
        Game game = gameRepository.findGameById(gameId);
        float totalScore = 0;
        float recommendedScore = 0;
        for(Review r : reviews){
            totalScore += r.getScore();
            if(r.isRecommended()){
                recommendedScore += booleanToInt(r.isRecommended());
            }
        }
        game.setScore(totalScore/reviews.size());
        game.setRecommendationScore(recommendedScore/reviews.size());
        return totalScore/reviews.size();
    }

    public List<Review> findAllReviewsByUser(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getReviewerId() == null){
            throw new IllegalStateException("Reviewer ID Cannot Be Empty/Null");
        }
        return reviewRepository.findReviewsByReviewerName(userRepository.findUserById(reviewRequest.getReviewerId()).getName());
    }

    public Page<Review> findAllReviewsByUserPaged(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getReviewerId() == null){
            throw new IllegalStateException("Reviewer ID Cannot Be Empty/Null");
        }
        if (reviewRequest.getReviewsPerPage() == null || reviewRequest.getReviewsPerPage() < 0) {
            reviewRequest.setReviewsPerPage(5);
        }
        if (reviewRequest.getPageNum() == null || reviewRequest.getPageNum() < 0){
            reviewRequest.setPageNum(0);
        }
            logger.info(reviewRequest.toString());
        return reviewRepository.fidnReviewsByReviewerIdPaged(reviewRequest.getReviewerId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
    }

    @Transactional
    public Review addReview(ReviewRequest reviewRequest) {
        Game game = null;
        User reviewer = null;
        try{
            reviewer = userRepository.findUserById(reviewRequest.getReviewerId());
            game = gameRepository.findGameById(reviewRequest.getGameId());
        }catch (Exception e){
            throw new IllegalStateException("Cannot create Review");
        }

        if(game == null){
            throw new IllegalStateException("Game Does Not Exist");
        }
        if(reviewer == null){
            throw new IllegalStateException("Reviewer Does Not Exist");
        }
        if(reviewRequest.getScore() == null || reviewRequest.getComment() == null){
            throw new IllegalStateException("Cannot create Incomplete Review");
        }

        if(reviewRequest.getGameVersion() == null){
            for(GameVersion ver: game.getVersions()){
                if(ver.getVersion().equals(reviewRequest.getGameVersion())){
                    break;
                }
            }
        }

        if(reviewRequest.getPlatform() != null){
            boolean platformExists = false;
            for(Platform platform : game.getPlatforms()){
                if(platform.equals(reviewRequest.getPlatform())){
                    platformExists = true;
                    break;
                }
            }
            if(!platformExists){
                throw new IllegalStateException("This Platform is not supported by this game!");
            }
        }

        if(reviewRequest.getScore() < 0 || reviewRequest.getScore() > 100){
            throw new IllegalStateException("Score Must Be Between 0 and 100");
        }

        Review review = Review.builder()
                .reviewer(userRepository.findUserById(reviewRequest.getReviewerId()))
                .reviewedGame(gameRepository.findGameById(reviewRequest.getGameId()))
                .gameVersion(reviewRequest.getGameVersion() == null ? gameRepository.findGameById(reviewRequest.getGameId()).getVersion() : reviewRequest.getGameVersion())
                .score(reviewRequest.getScore())
                .comment(reviewRequest.getComment())
                .recommended(reviewRequest.getRecommended())
                .numberOfDislikes(0)
                .numberOfDislikes(0)
                .likes(new ArrayList<User>())
                .dislikes(new ArrayList<User>())
                .playTime(reviewRequest.getPlayTime() == null ? null : reviewRequest.getPlayTime())
                .platform(reviewRequest.getPlatform() == null ? null : reviewRequest.getPlatform())
                .createdAt(new java.sql.Date(System.currentTimeMillis()))
                .sponsored(reviewRequest.getIsSponsored() == null ? false : reviewRequest.getIsSponsored())
                .build();
        try{
            reviewRepository.save(review);
            reviewer.setNumOfReviews((reviewer.getNumOfReviews() == null ? 0 : reviewer.getNumOfReviews()) + 1);
            reviewer.setReviews(reviewRepository.findReviewsByReviewerName(reviewer.getName()));
            userRepository.save(reviewer);
            reviewRequest.setReviewId(review.getId());
            sentimentAnalysisForReview(reviewRequest);

            updateScoreOfGameByReview(reviewRequest.getGameId());
            Review rFinal = reviewRepository.findReviewById(review.getId());
            rFinal.getReviewer().setReviews(null);
            rFinal.getReviewedGame().setGameReviews(null);
            if (rFinal.getReviewedGame().getBaseGame() != null){
                rFinal.getReviewedGame().getBaseGame().setGameReviews(null);
            }
            return rFinal;
        } catch (IOException e){
            throw new IllegalStateException("Cannot create Review");
        } catch (DataIntegrityViolationException e){
            throw new IllegalStateException("Cannot create Review for the same game version twice! Please edit your old review instead!");
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void removeReviewByReviewerUsername(Review review){
        List<Review> r = reviewRepository.findReviewsByReviewerName(review.getReviewer().getName());
        if(r == null || r.isEmpty()){
            throw new IllegalStateException("Reviewer Does Not Exist");
        } else {
            for(Review re : r){
                reviewRepository.delete(re);
                updateScoreOfGameByReview(re.getReviewedGame().getId());
            }
        }
    }

    @Transactional
    public void removeReview(ReviewRequest reviewReq){
        Review review = reviewRepository.findReviewById(reviewReq.getReviewId());
        if(review != null){
            reviewRepository.delete(review);
            updateScoreOfGameByReview(review.getReviewedGame().getId());
        } else {
            throw new IllegalStateException("Review Does Not Exist");
        }
    }

    public List<Review> getReviewByGameId(ReviewRequest reviewReq) {
        if(reviewReq == null || reviewReq.getGameId() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        List<Review> reviews;
        if(reviewReq.getRecommended() == null && reviewReq.getSentiment() == null){
            reviews = reviewRepository.findReviewsByGameId(reviewReq.getGameId());
        } else if (reviewReq.getSentiment() != null && reviewReq.getRecommended() == null) {
            reviews = reviewRepository.findReviewsByGameIdAndSentiment(reviewReq.getGameId(), reviewReq.getSentiment());
        } else if (reviewReq.getSentiment() == null && reviewReq.getRecommended() != null) {
            reviews = reviewRepository.findReviewsByGameIdAndRecommended(reviewReq.getGameId(), reviewReq.getRecommended());
        }
        else {
            reviews = reviewRepository.findReviewsByGameIdAndSentimentAndRecommended(reviewReq.getGameId(), reviewReq.getSentiment(), reviewReq.getRecommended());
        }

        if(reviews != null){
            return reviews;
        } else {
            throw new IllegalStateException("Review/Game Does Not Exist");
        }
    }


    public List<Review> getMostRecentReviews(ReviewRequest reviewReq){
        if(reviewReq == null || reviewReq.getNumberOfReviews() == null){
            throw new IllegalStateException("Number of Reviews Cannot Be Empty/Null");
        }
        return reviewRepository.findMostRecentReviews(PageRequest.of(0,reviewReq.getNumberOfReviews()));
    }

    public List<Review> findReviewsByGameIdAndVersion(ReviewRequest reviewReq) {
        if(reviewReq == null || reviewReq.getGameId() == null || reviewReq.getGameVersion() == null){
            throw new IllegalStateException("Game ID/Game Version Cannot Be Empty/Null");
        }
        List<Review> reviews;
        if(reviewReq.getRecommended() == null && reviewReq.getSentiment() == null){
            reviews = reviewRepository.findReviewsByIdAndGameVersion(reviewReq.getGameId(),reviewReq.getGameVersion());
        } else if (reviewReq.getSentiment() != null && reviewReq.getRecommended() == null) {
            reviews = reviewRepository.findReviewsByIdAndGameVersionAndSentiment(reviewReq.getGameId(),reviewReq.getGameVersion(),reviewReq.getSentiment());
        } else if (reviewReq.getSentiment() == null && reviewReq.getRecommended() != null) {
            reviews = reviewRepository.findReviewsByIdAndGameVersionAndRecommended(reviewReq.getGameId(), reviewReq.getGameVersion(), reviewReq.getRecommended());
        }
        else {
            reviews = reviewRepository.findReviewsByIdAndGameVersionAndSentimentAndRecommended(reviewReq.getGameId(),reviewReq.getGameVersion(), reviewReq.getSentiment(), reviewReq.getRecommended());
        }
        if(reviews != null){
            return reviews;
        } else {
            throw new IllegalStateException("Review/Game Does Not Exist");
        }
    }


    public List<Review> findReviewsByIdOrderByScore(ReviewRequest reviewReq) {
        if(reviewReq == null || reviewReq.getGameId() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        List<Review> reviews = reviewRepository.findReviewsByGameIdOrderByScore(reviewReq.getGameId());
        if(reviews != null){
            return reviews;
        } else {
            throw new IllegalStateException("Review/Game Does Not Exist");
        }
    }

    public ReviewCountResponse getGameReviewsCount(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getGameId() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        Integer numberOfReviews = reviewRepository.findReviewsByGameId(reviewRequest.getGameId()).size();
        Integer numberOfPositiveReviews = reviewRepository.countDistinctByPositiveSentiment(reviewRequest.getGameId());
        Integer numberOfNegativeReviews = reviewRepository.countDistinctByNegativeSentiment(reviewRequest.getGameId());
        Integer numberOfNeutralReviews = numberOfReviews - numberOfPositiveReviews - numberOfNegativeReviews;
        Float averageScore = reviewRepository.avgScoreByGameId(reviewRequest.getGameId()).floatValue();
        return ReviewCountResponse.builder()
                .numberOfReviews(numberOfReviews)
                .numberOfPositiveReviews(numberOfPositiveReviews)
                .numberOfNegativeReviews(numberOfNegativeReviews)
                .numberOfNeutralReviews(numberOfNeutralReviews)
                .averageScore(averageScore)
                .build();
    }

    public Boolean hasUserReviewedGame(ReviewRequest reviewReq) {
        if (reviewReq.getGameId() == null || reviewReq.getReviewerId() == null) {
            throw new IllegalStateException("Game ID/Reviewer ID Cannot Be Empty/Null");
        }
        Review review = reviewRepository.findReviewByReviewerAndReviewedGame(reviewReq.getReviewerId(), reviewReq.getGameId());
        return review != null;
    }
}
