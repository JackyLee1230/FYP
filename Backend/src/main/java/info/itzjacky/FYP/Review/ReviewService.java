package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameRepository;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.core.RepositoryCreationException;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.rmi.AccessException;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private Environment env;

    @Autowired
    ReviewRepository reviewRepository;

    Logger logger = LoggerFactory.getLogger(ReviewService.class);
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;

    @Transactional
    public List<Review> getAllReviews(){
        return reviewRepository.findAll();
    }


    @Transactional
    public Integer sentimentAnalysisForReview(ReviewRequest reviewReq) throws IOException {
        Runtime rt = Runtime.getRuntime();
        Review review = reviewRepository.findReviewById(reviewReq.getReviewId());
        logger.info("Running Sentiment Analysis Script! ReviewId:" + review.getId() + " Comment:" + review.getComment());
        try {
            ProcessBuilder pb = new ProcessBuilder("python", env.getProperty("SENTIMENT_ANALYSIS_SCRIPT_PATH"), review.getComment());
            pb.redirectErrorStream(true);
            Process extractProcess = pb.start();
            StringBuilder programOutput = new StringBuilder();
            try (BufferedReader processOutputReader = new BufferedReader(
                    new InputStreamReader(extractProcess.getInputStream()));)
            {
                String readLine;
                while ((readLine = processOutputReader.readLine()) != null)
                {
                    programOutput.append(readLine).append(System.lineSeparator());
                }
                extractProcess.waitFor();
            }
            review.setSentiment(Integer.parseInt(programOutput.toString().trim()));
            review.setSentimentUpdatedAt(new java.sql.Date(System.currentTimeMillis()));
            return Integer.parseInt(programOutput.toString().trim());
        } catch (IOException | InterruptedException e) {
            throw new IllegalStateException("Sentiment Analysis Failed! " + e.getMessage());
        }
    }

    @Transactional
    public Review addReview(Review review){
        try{
            reviewRepository.save(review);
            Game game = review.getReviewedGame();
            List<Review> reviews = reviewRepository.findReviewByGameId(game.getId());
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
        List<Review> reviews = reviewRepository.findReviewByGameId(gameId);
        float totalScore = 0;
        for(Review r : reviews){
            totalScore += r.getScore();
        }
        return totalScore/reviews.size();
    }

    @Transactional
    public Review addReview(ReviewRequest reviewRequest) throws SQLException {
        User reviewer = userRepository.findUserById(reviewRequest.getReviewerId());
        Game game = gameRepository.findGameById(reviewRequest.getGameId());

        if(reviewer == null || game == null || reviewRequest.getScore() == null || reviewRequest.getComment() == null){
            throw new IllegalStateException("Cannot create Review");
        }
        Review review = Review.builder()
                .reviewer(userRepository.findUserById(reviewRequest.getReviewerId()))
                .reviewedGame(gameRepository.findGameById(reviewRequest.getGameId()))
                .score(reviewRequest.getScore())
                .comment(reviewRequest.getComment())
                .recommended(reviewRequest.isRecommended())
                .createdAt(new java.sql.Date(System.currentTimeMillis()))
                .build();
        try{
            reviewRepository.save(review);
            reviewRequest.setReviewId(review.getId());
            sentimentAnalysisForReview(reviewRequest);
            updateScoreOfGameByReview(reviewRequest.getGameId());
            return review;
        } catch (IOException e){
            throw new SQLException("Cannot create Review");
        } catch (DataIntegrityViolationException e){
            throw new SQLException("Cannot create Review for the same game version twice! Please edit your old review instead!");
        }
    }

    @Transactional
    public void removeReviewByReviewerUsername(Review review){
        Optional<Review> r = reviewRepository.findReviewByReviewerName(review.getReviewer().getName());
        if(!r.isPresent()){
            throw new IllegalStateException("Reviewer Does Not Exist");
        } else {
            reviewRepository.delete(review);
            updateScoreOfGameByReview(review.getReviewedGame().getId());
        }
    }

    @Transactional
    public void removeReviewByReviewerUsername(String username){
        Optional<Review> r = reviewRepository.findReviewByReviewerName(username);
        if(!r.isEmpty()){
            throw new IllegalStateException("Reviewer Does Not Exist");
        } else {
            Review review = r.get();
            reviewRepository.delete(review);
            updateScoreOfGameByReview(review.getReviewedGame().getId());
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
        List<Review> reviews = reviewRepository.findReviewByGameId(reviewReq.getGameId());
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
}
