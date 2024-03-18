package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.RabbitMQ.RabbitMQProducer;
import info.itzjacky.FYP.Storage.DigitalOceanStorageService;
import info.itzjacky.FYP.User.User;
import jakarta.persistence.Transient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    ReviewService reviewService;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private RabbitMQProducer rabbitMQProducer;
    @Autowired
    DigitalOceanStorageService storageService;

    Logger logger = LoggerFactory.getLogger(ReviewController.class);

    @PostMapping("/getAllReviews")
    public ResponseEntity<List<Review>> getAllReviews(){
        return new ResponseEntity<>(reviewService.getAllReviews(), HttpStatus.OK);
    }

    @PostMapping("/editReview/{reviewId}")
    public ResponseEntity<Review> editReview(@PathVariable Integer reviewId, @RequestBody ReviewRequest reviewReq, @AuthenticationPrincipal User u){
        try{
            return new ResponseEntity<>(reviewService.editReview(reviewId, reviewReq, u), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    /*
    * args gameId: Integer (Game.id)
    */
    @PostMapping("/findReviewsByGameId")
    public ResponseEntity<List<Review>> getReviewByGameId(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewsByGameId(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    /*
     * args gameId: Integer (Game.id)
     *      reviewsPerPage: Integer
     *      pageNum: Integer
     */
    @PostMapping("/findReviewsByGameIdPaged")
    public ResponseEntity<Page<Review>> getReviewByGameIdPaged(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewsByGameIdPaged(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/resendForSentimentAnalysis")
    public ResponseEntity<Void> resendForSentimentAnalysis(@RequestBody ReviewRequest reviewReq){
        try{
            reviewService.resendForSentimentAnalysis(reviewReq);
            return ResponseEntity.noContent().build();
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(500), e.getMessage());
        }
    }

    @PostMapping("/findReviewsByReviewerIdPaged")
    public ResponseEntity<Page<Review>> findReviewsByReviewerIdPaged(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewsByReviewerIdPaged(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/sendForTopicModelling")
    public ResponseEntity<Void> sendForTopicModelling(@RequestBody ReviewRequest reviewReq){
        try{
            Review r = reviewRepository.findReviewById(reviewReq.getReviewId());
            reviewReq.setReviewId(r.getId());
            reviewReq.setComment(r.getComment());
            reviewReq.setGenres(r.getReviewedGame().getGenre());
            reviewReq.setGameName(r.getReviewedGame().getName());
            reviewService.topicModelingForReview(reviewReq);
            return ResponseEntity.noContent().build();
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(500), e.getMessage());
        }
    }


    @PostMapping("/hasUserReviewedGame")
    public ResponseEntity<Review> hasUserReviewedGame(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.hasUserReviewedGame(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findReviewsByGameIdAndRecommendedPaged")
    public ResponseEntity<Page<Review>> getReviewByGameIdAndRecommendedPaged(@RequestBody ReviewRequest reviewReq){
        try{
            Page<Review> reviews = reviewService.findReviewsByGameIdAndRecommendedPaged(reviewReq);
//            for each review get content, get the reviewer and set the reviewer's reviews to null
            for(Review review : reviews.getContent()){
                review.getReviewer().setReviews(null);
                review.setReviewedGame(null);
            }

            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    /*
     * args reviewId: Integer (review.id)
     */
    @PostMapping("/findReviewById")
    public ResponseEntity<Review> findReviewByReviewId(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewById(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findReviewByReviewerIdPaged")
    public ResponseEntity<Page<Review>> findReviewByReviewerIdPaged(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewsByReviewerIdPaged(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findReviewCommentsByReviewId")
    public ResponseEntity<List<ReviewComment>> findReviewCommentsByReviewId(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewCommentsByReviewId(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("findReviewsByGameIdAndVersion")
    public ResponseEntity<List<Review>> getReviewsByGameIdAndVersion(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewsByGameIdAndVersion(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findReviewsByIdOrderByScore")
    public ResponseEntity<List<Review>> getReviewsByIdOrderByScore(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findReviewsByIdOrderByScore(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    @PostMapping("/reaction")
    public ResponseEntity<Object> reaction(@RequestBody ReviewRequest reviewReq, @AuthenticationPrincipal User u){
        if (u == null || !Objects.equals(u.getId(), reviewReq.getLikerId())) {
            throw new AccessDeniedException("Access Denied");
        }
        try{
            return new ResponseEntity<>(reviewService.reaction(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getTopLikedReviews")
    public ResponseEntity<List<Review>> getTopLikedReviews(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getTopLikedReviews(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

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

//

    @Transient
    @Transactional
    @PostMapping("/uploadReviewImages/{reviewId}")
    public ResponseEntity<Integer> uploadFiles(@PathVariable String reviewId, @RequestParam("files") MultipartFile[] files, @AuthenticationPrincipal User u) {
        String message = "";
        if(u == null) {
            throw new AccessDeniedException("Access Denied");
        }
        try {
            List<String> fileNames = new ArrayList<>();
            AtomicReference<Integer> imageId = new AtomicReference<>(0);

            Arrays.asList(files).stream().forEach(file -> {
                storageService.uploadFile("review/" + reviewId + "/" + imageId + ".jpg", file, u.getName());
                fileNames.add("review/" + reviewId + "/" + imageId + ".jpg");
                imageId.getAndSet(imageId.get() + 1);

            });

            Review r = reviewRepository.findReviewById(Integer.parseInt(reviewId));
            r.setReviewImages(fileNames);
            reviewRepository.save(r);

            message = "Uploaded the files for review " + reviewId + " successfully: " + fileNames;
            logger.info(message);
            return ResponseEntity.status(HttpStatus.OK).body(imageId.get());
        } catch (Exception e) {
            message = "Fail to upload files for reviewId " + reviewId + "!";
            logger.warn(message);
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(-1);
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
//    @PostMapping("/getAllReviewCommentsById")
//    public ResponseEntity<List<ReviewComment>> getAllReviewCommentsById(@RequestBody ReviewCommentRequest reviewCommentRequest){
//        try{
//            return new ResponseEntity<>(reviewService.getAllReviewCommentsById(reviewCommentRequest), HttpStatus.OK);
//        } catch (Exception e){
//            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
//        }
//    }

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
    @PostMapping("/findAllReviewsByUser")
    public ResponseEntity<List<Review>> findAllReviewsByUser(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findAllReviewsByUser(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    /*
     * args reviewerId: Integer
     */
    @PostMapping("/findAllReviewsByUserPaged")
    public ResponseEntity<Page<Review>> findAllReviewsByUserPaged(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.findAllReviewsByUserPaged(reviewReq), HttpStatus.OK);
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

    @PostMapping("/getReviewCount")
    public ResponseEntity<ReviewCountResponse> getReviewCount(@RequestBody ReviewRequest reviewReq){
        try{
            return new ResponseEntity<>(reviewService.getGameReviewsCount(reviewReq), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
