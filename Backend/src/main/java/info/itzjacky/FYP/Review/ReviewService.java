package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.GameRepository;
import info.itzjacky.FYP.User.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    ReviewRepository reviewRepository;

    Logger logger = LoggerFactory.getLogger(ReviewService.class);
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;

    public List<Review> getAllReviews(){
        return reviewRepository.findAll();
    }

    public Review addReview(Review review){
        try{
            reviewRepository.save(review);
            return review;
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

    public Review addReview(ReviewRequest reviewRequest){
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
            return review;
        }catch (Exception e){
            throw new IllegalStateException("Reviewer Does Not Exist");
        }
    }

    public void removeReviewByReviewerUsername(Review review){
        Optional<Review> r = reviewRepository.findReviewByReviewerName(review.getReviewer().getName());
        if(!r.isPresent()){
            throw new IllegalStateException("Reviewer Does Not Exist");
        } else {
            reviewRepository.delete(review);
        }
    }

    public void removeReviewByReviewerUsername(String username){
        Optional<Review> r = reviewRepository.findReviewByReviewerName(username);
        if(!r.isEmpty()){
            throw new IllegalStateException("Reviewer Does Not Exist");
        } else {
            Review review = r.get();
            reviewRepository.delete(review);
        }
    }

    public void removeReview(ReviewRequest reviewReq){
        Review review = reviewRepository.findReviewById(reviewReq.getReviewId());
        if(review != null){
            reviewRepository.delete(review);
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
