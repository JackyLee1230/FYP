package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.*;
import info.itzjacky.FYP.RabbitMQ.RabbitMQProducer;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserRepository;
import info.itzjacky.FYP.Utils.Others;
import jakarta.transaction.Transactional;
import org.apache.http.HttpStatus;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
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


//    @Scheduled(cron = "0 * * * * *")
    public void testCronJob(){
        logger.info("Cron Job Running at " + new Date().toString());
    }


    public Boolean resendForSentimentAnalysis (@RequestBody ReviewRequest req) {
        if (req.getResentSentimentId() == null || req.getResentSentimentId().isEmpty()) {
            throw new IllegalStateException("No review id provided");
        }
        for (Integer reviewId : req.getResentSentimentId()) {
            Review review = reviewRepository.findReviewById(reviewId);
            if (review == null) {
                throw new IllegalStateException("Review does not exist");
            }
            rabbitMQProducer.sendMessagetoRabbitMQ(String.format("%s;%s", review.getId(), review.getComment()));
        }
        return true;
    }

    public List<Review> getTopLikedReviews(ReviewRequest reviewRequest){
        try{
            if(reviewRequest.getNumberOfReviews() == null || reviewRequest.getNumberOfReviews() < 1){
                reviewRequest.setNumberOfReviews(10);
            }
            List<Review> r = reviewRepository.findMostLikedReviews(reviewRequest.getNumberOfReviews());
            for (Review review : r){
                review.getReviewer().setReviews(null);
                review.getReviewer().setDevelopedGames(null);
                review.getReviewedGame().setGameReviews(null);
                review.getReviewedGame().setBaseGame(null);
                review.setLikes(null);
                review.setDislikes(null);
//                List<Integer> likedUsers = reviewRepository.findLikedUsersByReviewId(review.getId());
//                review.setLikedUsers(likedUsers);
//                List<Integer> dislikedUsers = reviewRepository.findDislikedUsersByReviewId(review.getId());
//                review.setDislikedUsers(dislikedUsers);
                Integer numberOfLikes = reviewRepository.countLikesByReviewId(review.getId());
                Integer numberOfDislikes = reviewRepository.countDislikesByReviewId(review.getId());
                review.setNumberOfLikes(numberOfLikes);
                review.setNumberOfDislikes(numberOfDislikes);
            }
            return r;
        } catch (Exception e){
            throw new IllegalStateException("Review Does Not Exist");
        }
    }

    @Transactional
    public void topicModelingForReview(ReviewRequest reviewReq) throws IOException, ExecutionException, InterruptedException {
        JSONObject request = new JSONObject();
        request.put("reviewId", reviewReq.getReviewId());
        request.put("reviewComment", reviewReq.getComment());
        request.put("genre", reviewReq.getGenres());
        request.put("name", reviewReq.getGameName());
        logger.info("Topic Modeling SENT to Python! ReviewId:" + reviewReq.getReviewId() + " Comment:" + reviewReq.getComment());
        String toBeSentToPython = String.format("%s;%s", reviewReq.getReviewId(), reviewReq.getComment());
        rabbitMQProducer.sendTopicModelingMessagetoRabbitMQ(request.toString());
    }

    @Transactional
    public void sentimentAnalysisForReview(ReviewRequest reviewReq) throws IOException, ExecutionException, InterruptedException {
        JSONObject request = new JSONObject();
        request.put("reviewId", reviewReq.getReviewId());
        request.put("reviewComment", reviewReq.getComment());
        logger.info("Sentiment Analysis SENT to Python! ReviewId:" + reviewReq.getReviewId() + " Comment:" + reviewReq.getComment());
//        String toBeSentToPython = String.format("%s;%s", reviewReq.getReviewId(), reviewReq.getComment());
        rabbitMQProducer.sendMessagetoRabbitMQ(request.toString());
    }


    public ReviewComment addReviewComment(ReviewCommentRequest reviewCommentRequest){
        if(reviewCommentRequest.getComment().isEmpty() || reviewCommentRequest.getCommenterId() == null || reviewCommentRequest.getReviewId() == null){
            throw new IllegalStateException("Cannot create Incomplete Review Comment");
        }
        try{
            Review r = reviewRepository.findReviewById(reviewCommentRequest.getReviewId());
            User u = userRepository.findUserById(reviewCommentRequest.getCommenterId());
            if(r == null){
                throw new IllegalStateException("Review Does Not Exist");
            }
            if(u == null){
                throw new IllegalStateException("User Does Not Exist");
            }
            ReviewComment reviewComment = ReviewComment.builder().commenter(u)
                    .review(r)
                    .comment(reviewCommentRequest.getComment())
                    .build();
            reviewCommentRepository.save(reviewComment);
            reviewComment.getCommenter().setReviews(null);
            reviewComment.getCommenter().setDevelopedGames(null);
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
        HashMap<String, Integer> reactionMap = new HashMap<String, Integer>();
        reactionMap.put("like", 0);
        reactionMap.put("dislike", 0);
        reactionMap.put("likeCount", 0);
        reactionMap.put("dislikeCount", 0);

        try {
            Review review = reviewRepository.findReviewById(reviewRequest.getReviewId());
            User liker = userRepository.findUserById(reviewRequest.getLikerId());
            if (review == null || liker == null) {
                throw new IllegalStateException("Cannot like/dislike review");
            }
            if(Reaction.LIKE.equals(reviewRequest.getReaction())){
                if (review.getLikes().contains(liker)) { // already liked
                    logger.info("already liked");
                    review.setLikes(new ArrayList<User>(review.getLikes()){{remove(liker);}});
//                  remove this review from the user's liked reviews
                    liker.setLikedReviews(new ArrayList<Review>(liker.getLikedReviews()){{remove(review);}});
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("likeCount", review.getLikes().size());
                    reactionMap.put("dislikeCount", review.getDislikes().size());
                    return reactionMap;
                }
                else if (review.getDislikes().contains(liker)) {
                    logger.info("user change from dislike to like");
                    //  user change from dislike to like
                    review.setLikes(new ArrayList<User>(review.getLikes()){{add(liker);}});
                    review.setDislikes(new ArrayList<User>(review.getDislikes()){{remove(liker);}});
//                    remove this review from the user's liked reviews
                    liker.setLikedReviews(new ArrayList<Review>(liker.getLikedReviews()){{add(review);}});
                    liker.setDislikedReviews(new ArrayList<Review>(liker.getLikedReviews()){{remove(review);}});
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("like", 1);
                    reactionMap.put("likeCount", review.getLikes().size());
                    reactionMap.put("dislikeCount", review.getDislikes().size());
                    return reactionMap;
                }
                else { // new like
                    logger.info("new like");
                    review.setLikes(new ArrayList<User>(review.getLikes()){{add(liker);}});
//                    add this review to the user's liked reviews
                    liker.setLikedReviews(new ArrayList<Review>(liker.getLikedReviews()){{add(review);}});
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("like", 1);
                    reactionMap.put("likeCount", review.getLikes().size());
                    reactionMap.put("dislikeCount", review.getDislikes().size());
                    return reactionMap;
                }
            } else if(Reaction.DISLIKE.equals(reviewRequest.getReaction())) {
                if (review.getDislikes().contains(liker)) { // already disliked
                    logger.info("already disliked");
                    review.setDislikes(new ArrayList<User>(review.getDislikes()){{remove(liker);}});
//                  remove this review from the user's disliked reviews
                    liker.setDislikedReviews(new ArrayList<Review>(liker.getDislikedReviews()){{remove(review);}});
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("dislike", 0);
                    reactionMap.put("likeCount", review.getLikes().size());
                    reactionMap.put("dislikeCount", review.getDislikes().size());
                    return reactionMap;
                }
                else if (review.getLikes().contains(liker)) {
                    logger.info("user change from like to dislike");
//                    user change from like to dislike
                    review.setLikes(new ArrayList<User>(review.getLikes()){{remove(liker);}});
                    review.setDislikes(new ArrayList<User>(review.getDislikes()){{add(liker);}});

//                    remove this review from the user's liked reviews
                    liker.setLikedReviews(new ArrayList<Review>(liker.getLikedReviews()){{remove(review);}});
                    liker.setDislikedReviews(new ArrayList<Review>(liker.getLikedReviews()){{add(review);}});
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("dislike", 1);
                    reactionMap.put("likeCount", review.getLikes().size());
                    reactionMap.put("dislikeCount", review.getDislikes().size());
                    return reactionMap;
                }
                else { // new dislike
                    logger.info("new dislike");
                    review.setDislikes(new ArrayList<User>(review.getDislikes()){{add(liker);}});
//                    add this review to the user's disliked reviews
                    liker.setDislikedReviews(new ArrayList<Review>(liker.getDislikedReviews()){{add(review);}});
                    userRepository.save(liker);
                    reviewRepository.save(review);
                    reactionMap.put("dislike", 1);
                    reactionMap.put("likeCount", review.getLikes().size());
                    reactionMap.put("dislikeCount", review.getDislikes().size());
                    return reactionMap;
                }
            }

        } catch (Exception e) {
            throw new IllegalStateException("Cannot like/dislike review");
        }
        return null;
    }


//    public List<ReviewComment> getAllReviewCommentsById(ReviewCommentRequest reviewCommentRequest){
//        try {
//            return reviewCommentRepository.findReviewCommentsByReview(reviewRepository.findReviewById(reviewCommentRequest.getReviewId()));
//        } catch (Exception e){
//            throw new IllegalStateException("Cannot get Review Comments");
//        }
//    }

    public Review findReviewById(ReviewRequest reviewRequest){
        try {
            Review r = reviewRepository.findReviewById(reviewRequest.getReviewId());
            r.getReviewer().setReviews(null);
            r.getReviewer().setDevelopedGames(null);
            r.getReviewedGame().setGameReviews(null);
            r.getReviewedGame().setBaseGame(null);
            List<Integer> likedUsers = reviewRepository.findLikedUsersByReviewId(reviewRequest.getReviewId());
            r.setLikedUsers(likedUsers);
            List<Integer> dislikedUsers = reviewRepository.findDislikedUsersByReviewId(reviewRequest.getReviewId());
            r.setDislikedUsers(dislikedUsers);
            Integer numberOfLikes = reviewRepository.countLikesByReviewId(reviewRequest.getReviewId());
            Integer numberOfDislikes = reviewRepository.countDislikesByReviewId(reviewRequest.getReviewId());
            r.setNumberOfLikes(numberOfLikes);
            r.setNumberOfDislikes(numberOfDislikes);
            r.setReviewComment(null);
            return r;
        } catch (Exception e){
            e.printStackTrace();
            throw new IllegalStateException("Cannot get Review");
        }
    }

    public List<ReviewComment> findReviewCommentsByReviewId(ReviewRequest reviewRequest){
        try {
            List<ReviewComment> rc = reviewCommentRepository.findReviewCommentsByReviewId(reviewRequest.getReviewId());
            for (ReviewComment reviewComment : rc){
                reviewComment.getCommenter().setReviews(null);
                reviewComment.getCommenter().setDevelopedGames(null);
                reviewComment.getCommenter().setLikedReviews(null);
                reviewComment.getCommenter().setDislikedReviews(null);
            }
            return rc;
        } catch (Exception e){
            throw new IllegalStateException("Cannot get Review Comments");
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
                if (reviewRequest.getFilterSpam()) {
                    r = reviewRepository.findReviewsByGameIdPagedSpamFilteredSortByCreatedAt(reviewRequest.getGameId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByGameIdPagedSortByCreatedAt(reviewRequest.getGameId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            } else {
                if (reviewRequest.getFilterSpam()) {
                    r = reviewRepository.findReviewsByGameIdPagedSpamFilteredSortByScore(reviewRequest.getGameId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByGameIdPagedSortByScore(reviewRequest.getGameId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            }

            for (Review review : r.getContent()){
                review.getReviewer().setReviews(null);
                review.setReviewedGame(null);
                Integer numberOfComments = reviewRepository.countCommentsByReviewId(review.getId());
                Integer numberOfLikes = reviewRepository.countLikesByReviewId(review.getId());
                Integer numberOfDislikes = reviewRepository.countDislikesByReviewId(review.getId());
                review.setNumberOfLikes(numberOfLikes);
                review.setNumberOfDislikes(numberOfDislikes);
                review.setNumberOfComments(numberOfComments);
                review.setReviewComment(null);
            }
            return r;
        } else {
            Page<Review> r = null;
            if (Objects.equals(reviewRequest.getSortBy(), "recency")) {
                if (reviewRequest.getFilterSpam()) {
                    r = reviewRepository.findReviewsByGameIdAndRecommendedPagedSpamFilteredSortByCreatedAt(reviewRequest.getGameId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByGameIdAndRecommendedPagedSortByCreatedAt(reviewRequest.getGameId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            }
            else {
                if (reviewRequest.getFilterSpam()) {
                    r = reviewRepository.findReviewsByGameIdAndRecommendedPagedSpamFilteredSortByScore(reviewRequest.getGameId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByGameIdAndRecommendedPagedSortByScore(reviewRequest.getGameId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            }

            for (Review review : r.getContent()){
                review.getReviewer().setReviews(null);
                review.setReviewedGame(null);
                Integer numberOfComments = reviewRepository.countCommentsByReviewId(review.getId());
                Integer numberOfLikes = reviewRepository.countLikesByReviewId(review.getId());
                Integer numberOfDislikes = reviewRepository.countDislikesByReviewId(review.getId());
                review.setNumberOfLikes(numberOfLikes);
                review.setNumberOfDislikes(numberOfDislikes);
                review.setNumberOfComments(numberOfComments);
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

    public Page<Review> findReviewsByReviewerIdPaged(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getReviewerId() == null){
            throw new IllegalStateException("Reviewer ID Cannot Be Empty/Null");
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
        // check order must be either "asc" or "desc"
        if (reviewRequest.getOrder() == null || (!reviewRequest.getOrder().equals("asc") && !reviewRequest.getOrder().equals("desc"))) {
            reviewRequest.setOrder("desc");
        }

        if (reviewRequest.getRecommended() == null) {
            Page<Review> r = null;
            if (Objects.equals(reviewRequest.getSortBy(), "recency")){
                if (reviewRequest.getOrder().equals("asc"))
                    r = reviewRepository.findReviewsByReviewerIdPagedSortByCreatedAtAsc(reviewRequest.getReviewerId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                else
                    r = reviewRepository.findReviewsByReviewerIdPagedSortByCreatedAt(reviewRequest.getReviewerId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
            } else {
                if (reviewRequest.getOrder().equals("asc")) {
                    r = reviewRepository.findReviewsByReviewerIdPagedSortByScoreAsc(reviewRequest.getReviewerId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByReviewerIdPagedSortByScore(reviewRequest.getReviewerId(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            }

            for (Review review : r.getContent()){
                review.setReviewer(null);
                review.getReviewedGame().setGameReviews(null);
                review.setReviewComment(null);
                review.getReviewedGame().setDLCS(null);
                review.getReviewedGame().setBaseGame(null);
                review.getReviewedGame().setDevelopers(null);
                review.getReviewedGame().setPublisher(null);
            }
            return r;
        } else {
            Page<Review> r = null;
            if (Objects.equals(reviewRequest.getSortBy(), "recency")) {
                if (reviewRequest.getOrder().equals("asc")) {
                    r = reviewRepository.findReviewsByReviewerIdAndRecommendedPagedSortByCreatedAtAsc(reviewRequest.getReviewerId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByReviewerIdAndRecommendedPagedSortByCreatedAt(reviewRequest.getReviewerId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            }
            else {
                if (reviewRequest.getOrder().equals("asc")) {
                    r = reviewRepository.findReviewsByReviewerIdAndRecommendedPagedSortByScoreAsc(reviewRequest.getReviewerId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                } else {
                    r = reviewRepository.findReviewsByReviewerIdAndRecommendedPagedSortByScore(reviewRequest.getReviewerId(), reviewRequest.getRecommended(), PageRequest.of(reviewRequest.getPageNum(), reviewRequest.getReviewsPerPage()));
                }
            }

            for (Review review : r.getContent()){
                review.setReviewer(null);
                review.getReviewedGame().setGameReviews(null);
                review.getReviewedGame().setBaseGame(null);
                review.getReviewedGame().setDLCS(null);
            }
            return r;
        }
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
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
//        take a date with format yyyy-MM-dd hh:mm:ss
//        and convert it to a java.sql.Date
        String createdAt = reviewRequest.getCreatedAt();
//        convert the string to a date
        java.sql.Date date = null;
        try {
            date = new java.sql.Date(formatter.parse(createdAt).getTime());
        } catch (Exception e){
            throw new IllegalStateException("Cannot create Review");
        }
        Review review = Review.builder()
                .reviewer(userRepository.findUserById(reviewRequest.getReviewerId()))
                .reviewedGame(gameRepository.findGameById(reviewRequest.getGameId()))
                .gameVersion(reviewRequest.getGameVersion() == null ? gameRepository.findGameById(reviewRequest.getGameId()).getVersion() : reviewRequest.getGameVersion())
                .score(reviewRequest.getScore())
                .comment(reviewRequest.getComment())
                .recommended(reviewRequest.getRecommended())
                .likes(new ArrayList<User>())
                .dislikes(new ArrayList<User>())
                .playTime(reviewRequest.getPlayTime() == null ? null : reviewRequest.getPlayTime())
                .platform(reviewRequest.getPlatform() == null ? null : reviewRequest.getPlatform())
                .createdAt(new java.sql.Date(System.currentTimeMillis()))
                .sponsored(reviewRequest.getIsSponsored() == null ? false : reviewRequest.getIsSponsored())
                .build();
        try{
            reviewRepository.save(review);

            if (review.getCreatedAt() != null) {
                review.setCreatedAt(date);
            }
            reviewRepository.save(review);
            reviewer.setNumOfReviews((reviewer.getNumOfReviews() == null ? 0 : reviewer.getNumOfReviews()) + 1);
            reviewer.setReviews(reviewRepository.findReviewsByReviewerName(reviewer.getName()));
            userRepository.save(reviewer);
            reviewRequest.setReviewId(review.getId());
            reviewRequest.setGameName(game.getName());
            reviewRequest.setGenres(game.getGenre());
            reviewRequest.setGameDescription(game.getDescription());
//            Send Mes`sage to RabbitMQ (SA + TM)
            sentimentAnalysisForReview(reviewRequest);
            topicModelingForReview(reviewRequest);

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

    public Review hasUserReviewedGame(ReviewRequest reviewReq) {
        if (reviewReq.getGameId() == null || reviewReq.getReviewerId() == null) {
            throw new IllegalStateException("Game ID/Reviewer ID Cannot Be Empty/Null");
        }
        Review review = reviewRepository.findReviewByReviewerAndReviewedGame(reviewReq.getReviewerId(), reviewReq.getGameId());
        if (review == null) {
            return null;
        }
        review.getReviewer().setReviews(null);
        review.setReviewedGame(null);
        return review;
    }

    @Transactional
    public Review editReview(Integer reviewId, ReviewRequest reviewReq, User u) throws IOException, ExecutionException, InterruptedException {
        if (reviewReq == null || reviewId == null) {
            throw new IllegalStateException("Review ID/Review Request Cannot Be Empty");
        }
        if (u == null) {
            throw new IllegalStateException("Please login to edit review!");
        }
        Review review = reviewRepository.findReviewById(reviewId);
        if (!Objects.equals(review.getReviewer().getId(), u.getId())) {
            throw new IllegalStateException("Unauthorized! You can only update your own review!");
        }
        boolean isUpdated = false;
        if (reviewReq.getScore() != null && (reviewReq.getScore() >= 0 && reviewReq.getScore() <= 100) && !reviewReq.getScore().equals(review.getScore())) {
            review.setScore(reviewReq.getScore());
            isUpdated = true;
        }
        if (reviewReq.getIsSponsored() != null && reviewReq.getIsSponsored() != review.getSponsored()) {
            review.setSponsored(reviewReq.getIsSponsored());
            isUpdated = true;
        }
        if (reviewReq.getPlayTime() != null && !reviewReq.getPlayTime().equals(review.getPlayTime())) {
            review.setPlayTime(reviewReq.getPlayTime());
            isUpdated = true;
        }
        if (reviewReq.getComment() != null && !reviewReq.getComment().equals(review.getComment())) {
            review.setComment(reviewReq.getComment());
            isUpdated = true;
        }
        if (reviewReq.getRecommended() != null && reviewReq.getRecommended() != review.isRecommended()) {
            review.setRecommended(reviewReq.getRecommended());
            isUpdated = true;
        }

        if (isUpdated) {
//            if edited within the past week, throw an error
            if (review.getEditedAt() != null && (System.currentTimeMillis() - review.getEditedAt().getTime()) < 604800000) {
                throw new IllegalStateException("You can update your review only once a week!");
            }
            review.setEditedAt(new Date(System.currentTimeMillis())); // update new review edited at
            if (review.getEditCount() == null) {
                review.setEditCount(1);
            } else {
                review.setEditCount(review.getEditCount() + 1);
            }
            reviewRepository.save(review);
//            send to sentiment analysis and topic modeling queue
            reviewReq.setReviewId(review.getId());
            sentimentAnalysisForReview(reviewReq);
            Game g = gameRepository.findGameById(review.getReviewedGame().getId());
            reviewReq.setGameName(g.getName());
            reviewReq.setGameDescription(g.getDescription());
            reviewReq.setGenres(g.getGenre());

            topicModelingForReview(reviewReq);
            review.getReviewer().setReviews(null);
            review.getReviewedGame().setGameReviews(null);
            if (review.getReviewedGame().getBaseGame() != null){
                review.getReviewedGame().getBaseGame().setGameReviews(null);
            }
            return review;
        } else {
            throw new IllegalStateException("No changes made to the review");
        }

    }
}
