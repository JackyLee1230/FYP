package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameRepository;
import info.itzjacky.FYP.Game.GameVersion;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.concurrent.ExecutionException;

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
    public Integer sentimentAnalysisForReview(ReviewRequest reviewReq) throws IOException, ExecutionException, InterruptedException {
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
        return 1;
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

    public List<ReviewComment> getAllReviewCommentsById(ReviewCommentRequest reviewCommentRequest){
        try {
            return reviewCommentRepository.findReviewCommentsByReview(reviewRepository.findReviewById(reviewCommentRequest.getReviewId()));
        } catch (Exception e){
            throw new IllegalStateException("Cannot get Review Comments");
        }
    }

    public List<Review> getReviewsByGameId(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getGameId() == null){
            throw new IllegalStateException("Game ID Cannot Be Empty/Null");
        }
        return reviewRepository.findReviewsByGameId(reviewRequest.getGameId());
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
            e.printStackTrace();
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
                recommendedScore += Others.booleanToInt(r.isRecommended());
            }
        }
        game.setScore(totalScore/reviews.size());
        game.setRecommendationScore(recommendedScore/reviews.size());
        return totalScore/reviews.size();
    }

    public List<Review> getAllReviewsByUser(ReviewRequest reviewRequest){
        if(reviewRequest == null || reviewRequest.getReviewerId() == null){
            throw new IllegalStateException("Reviewer ID Cannot Be Empty/Null");
        }
        return reviewRepository.findReviewsByReviewerName(userRepository.findUserById(reviewRequest.getReviewerId()).getName());
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

        if(reviewRequest.getScore() < 0 || reviewRequest.getScore() > 100){
            throw new IllegalStateException("Score Must Be Between 0 and 100");
        }

        Review review = Review.builder()
                .reviewer(userRepository.findUserById(reviewRequest.getReviewerId()))
                .reviewedGame(gameRepository.findGameById(reviewRequest.getGameId()))
                .gameVersion(reviewRequest.getGameVersion() == null ? gameRepository.findGameById(reviewRequest.getGameId()).getVersion() : reviewRequest.getGameVersion())
                .score(reviewRequest.getScore())
                .comment(reviewRequest.getComment())
                .recommended(reviewRequest.isRecommended())
                .createdAt(new java.sql.Date(System.currentTimeMillis()))
                .build();
        try{
            reviewRepository.save(review);
            reviewer.setNumOfReviews((reviewer.getNumOfReviews() == null ? 0 : reviewer.getNumOfReviews()) + 1);
            reviewer.setReviews(reviewRepository.findReviewsByReviewerName(reviewer.getName()));
            userRepository.save(reviewer);
            reviewRequest.setReviewId(review.getId());
            sentimentAnalysisForReview(reviewRequest);

            updateScoreOfGameByReview(reviewRequest.getGameId());
            return reviewRepository.findReviewById(review.getId());
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
        List<Review> reviews = reviewRepository.findReviewsByGameId(reviewReq.getGameId());
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

    public List<Review> getReviewsByGameIdAndVersion(ReviewRequest reviewReq) {
        if(reviewReq == null || reviewReq.getGameId() == null || reviewReq.getGameVersion() == null){
            throw new IllegalStateException("Game ID/Game Version Cannot Be Empty/Null");
        }
        List<Review> reviews = reviewRepository.findReviewsByIdAndGameVersion(reviewReq.getGameId(), reviewReq.getGameVersion());
        if(reviews != null){
            return reviews;
        } else {
            throw new IllegalStateException("Review/Game Does Not Exist");
        }
    }


    public List<Review> getReviewsByIdOrderByScore(ReviewRequest reviewReq) {
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
}
