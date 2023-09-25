package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.RabbitMQ.RabbitMQProducer;
import info.itzjacky.FYP.User.User;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpResponse;
import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    ReviewService reviewService;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    @PostMapping("/getAllReviews")
    public ResponseEntity<List<Review>> getAllReviews(){
        return new ResponseEntity<>(reviewService.getAllReviews(), HttpStatus.OK);
    }


    /*
    * args gameId: Integer (Game.id)
    */
    @PostMapping("/getReviewsByGameId")
    public ResponseEntity<List<Review>> getReviewByGameId(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getReviewByGameId(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("getReviewsByGameIdAndVersion")
    public ResponseEntity<List<Review>> getReviewsByGameIdAndVersion(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getReviewsByGameIdAndVersion(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getReviewsByIdOrderByScore")
    public ResponseEntity<List<Review>> getReviewsByIdOrderByScore(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getReviewsByIdOrderByScore(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

//    @PostMapping

    /*
    * args reviewId: Integer (Review.id)
    */
    @PostMapping("/sentimentAnalysis")
    public ResponseEntity<Void> sentimentAnalysisForReview(@RequestBody ReviewRequest reviewReq){
        try{
            reviewService.sentimentAnalysisForReview(reviewReq);
            return ResponseEntity.noContent().build();
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(500), e.getMessage());
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
    public ResponseEntity<Review> addUser(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.addReview(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/addReviewComment")
    public ResponseEntity<ReviewComment> addReviewComment(@RequestBody ReviewCommentRequest reviewCommentRequest){
        try{
            return new ResponseEntity<>(reviewService.addReviewComment(reviewCommentRequest), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    /*
    * args reviewId: Integer
    */
    @PostMapping("/getAllReviewCommentsById")
    public ResponseEntity<List<ReviewComment>> getAllReviewCommentsById(@RequestBody ReviewCommentRequest reviewCommentRequest){
        try{
            return new ResponseEntity<>(reviewService.getAllReviewCommentsById(reviewCommentRequest), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    /*
     * args reviewId: Integer
     */
    @PostMapping("/removeReview")
    public ResponseEntity<Void> removeReview(@RequestBody ReviewRequest reviewReq){
        try{
            reviewService.removeReview(reviewReq);
            return ResponseEntity.noContent().build();
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    /*
     * args numberOfReviews: Integer
     */
    @PostMapping("/getMostRecentReviews")
    public ResponseEntity<List<Review>> getMostRecentReviews(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getMostRecentReviews(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    /*
    * args reviewerId: Integer
    */
    @PostMapping("/getAllReviewsByUser")
    public ResponseEntity<List<Review>> getAllReviewsByUser(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getAllReviewsByUser(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/testRabbitMQ")
    public ResponseEntity<Void> testRabbitMQ(@RequestBody ReviewRequest reviewReq){
        try{
            String toBeSentToPython = String.format("%s;%s", reviewReq.getReviewId(), reviewReq.getComment());
            rabbitMQProducer.sendMessagetoRabbitMQ(toBeSentToPython);
            return ResponseEntity.noContent().build();
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
