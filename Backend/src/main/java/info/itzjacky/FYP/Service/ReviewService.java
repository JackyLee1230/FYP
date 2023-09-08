package info.itzjacky.FYP.Service;

import info.itzjacky.FYP.Entity.Review;
import info.itzjacky.FYP.Entity.User;
import info.itzjacky.FYP.Repository.ReviewRepository;
import info.itzjacky.FYP.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    public List<Review> getAllReviews(){
        return reviewRepository.findAll();
    }

    public Review addReview(Review review){
        logger.info(review.toString());
        try{
            reviewRepository.save(review);
            return review;
        }catch (Exception e){
            e.printStackTrace();
            return null;
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

    public void removeReview(Review review){
        if(review != null){
            reviewRepository.delete(review);
        }
    }

    public List<Review> getReviewByGameName(String gameName) {
        return reviewRepository.findReviewByGameName(gameName);
    }
}
