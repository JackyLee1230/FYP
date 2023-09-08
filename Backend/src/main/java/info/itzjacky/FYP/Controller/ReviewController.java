package info.itzjacky.FYP.Service;

import info.itzjacky.FYP.Entity.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    ReviewService reviewService;

    @GetMapping("/getAllReviews")
    public List<Review> getAllReviews(){
        return reviewService.getAllReviews();
    }

    @GetMapping("/getReviewByGameName")
    public List<Review> getReviewByGameName(@RequestParam String gameName){
        return reviewService.getReviewByGameName(gameName);
    }

    @PostMapping("/addReview")
    public Review addUser(@RequestBody Review review){
        return reviewService.addReview(review);
    }
//
//    @PostMapping("/removeUser")
//    public void removeUser(@RequestBody User user){
//        userService.removeUser(user);
//    }
//
//    @PostMapping("/removeUserByBane")
//    public void removeUserByName(@RequestBody User user){
//        userService.removeUserByName(user);
//    }
//
//    @PostMapping("/findUserByName")
//    public Optional<User> findUserByName(@RequestBody User user){
//        return userService.findUserByName(user.getName());
//    }
}
