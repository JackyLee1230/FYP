package info.itzjacky.FYP.Review;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    ReviewService reviewService;

    @PostMapping("/getAllReviews")
    public List<Review> getAllReviews(){
        return reviewService.getAllReviews();
    }


    /*
    * args gameId: Integer (Game.id)
    */
    @PostMapping("/getReviewsByGameId")
    public List<Review> getReviewByGameId(@RequestBody ReviewRequest reviewReq){
        try{
            return reviewService.getReviewByGameId(reviewReq);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    /*
     * args
     *  {
     *     "reviewerId": Integer (User.id),
     *    "score": Integer
     *     "recommended": boolean,
     *     "comment": String (varchar 10000),
     *     "gameId": Integer (Game.id)
     *   }
     */
    @PostMapping("/addReview")
    public Review addUser(@RequestBody ReviewRequest reviewReq){
        try{
            return reviewService.addReview(reviewReq);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    /*
     * args reviewId: Integer
     */
    @PostMapping("/removeReview")
    public void removeReview(@RequestBody ReviewRequest reviewReq){
        try{
            reviewService.removeReview(reviewReq);;
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    /*
     * args numberOfReviews: Integer
     */
    @PostMapping("/getMostRecentReviews")
    public List<Review> getMostRecentReviews(@RequestBody ReviewRequest reviewReq){
        try{
            return reviewService.getMostRecentReviews(reviewReq);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
