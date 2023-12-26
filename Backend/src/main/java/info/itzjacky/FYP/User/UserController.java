package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Auth.AuthenticationController;
import info.itzjacky.FYP.Auth.AuthenticationService;
import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.Review.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserService userService;

    @Autowired
    AuthenticationService authenticationService;

    Logger logger = LoggerFactory.getLogger(UserController.class);
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

//    @PostMapping("/login")
//    public ResponseEntity<UserDto> login(@RequestBody UserRequest userRequest){
//        try{
//            return new ResponseEntity<>(UserMapper.INSTANCE.userToUserDTO(userService.login(userRequest)), HttpStatus.OK);
//        }catch (Exception e) {
//            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
//        }
//    }

//    @PostMapping("/register")
//    public ResponseEntity<UserDto> register(@RequestBody UserRequest userRequest){
//        try{
//            return new ResponseEntity<>(UserMapper.INSTANCE.userToUserDTO(userService.register(userRequest)), HttpStatus.OK);
//        }catch (Exception e) {
//            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
//        }
//    }

    @PostMapping("/getUserByResetPasswordToken")
    public ResponseEntity<User> getUserByResetPasswordToken(@RequestBody UserRequest userRequest){
        try{
            return new ResponseEntity<>(userService.getUserByResetPasswordToken(userRequest.getResetPasswordToken()), HttpStatus.OK);
        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getUserByVerificationToken")
    public ResponseEntity<User> getUserByVerificationToken(@RequestBody UserRequest userRequest){
        try{
            logger.info(userRequest.toString());
            return new ResponseEntity<>(userService.getUserByVerificationToken(userRequest.getVerificationToken()), HttpStatus.OK);
        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/sendVerifyEmail")
    public ResponseEntity<Void> sendVerifyEmail(@RequestBody UserRequest userRequest, @AuthenticationPrincipal User u){
        if (u == null || !Objects.equals(u.getId(), userRequest.getId())) {
            throw new AccessDeniedException("Access Denied");
        }
        try{
            logger.info(userRequest.toString());
            User user = userService.findUserByEmail(userRequest.getEmail());
            if(user == null){
                throw new IllegalStateException("User Not Found");
            }
            if(user.getIsVerified() == true) {
                throw new IllegalStateException("User Already Verified");
            }
            String token = UUID.randomUUID().toString().replace("-", "");
            authenticationService.sendVerifyEmail(userRequest.getEmail(), token);
            user.setVerificationToken(token);
            userRepository.save(user);
            return ResponseEntity.noContent().build();
        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/togglePrivate")
    public ResponseEntity<User> togglePrivate(@RequestBody UserRequest userRequest, @AuthenticationPrincipal User u){
        if (u == null || !Objects.equals(u.getId(), userRequest.getId())) {
            throw new AccessDeniedException("Access Denied");
        }
        try{
            return new ResponseEntity<>(userService.togglePrivate(userRequest), HttpStatus.OK);
        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/updateUsername")
    public ResponseEntity<User> updateUsername(@RequestBody UserRequest userRequest, @AuthenticationPrincipal User u){
        if (u == null || !Objects.equals(u.getId(), userRequest.getId())) {
            throw new AccessDeniedException("Access Denied");
        }
        try{
            return new ResponseEntity<>(userService.updateUsername(userRequest), HttpStatus.OK);
        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/addUser")
    public ResponseEntity<User> addUser(@RequestBody User user){
        try{
            return new ResponseEntity<>(userService.addUser(user), HttpStatus.OK);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/removeUser")
    public ResponseEntity<Void> removeUser(@RequestBody User user){
        try {
            userService.removeUser(user);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/removeUserByName")
    public ResponseEntity<Void> removeUserByName(@RequestBody User user){
        try {
            userService.removeUserByName(user);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findUserByName")
    public ResponseEntity<User> findUserByName(@RequestBody UserRequest userRequest){
        try {
            if (userRequest.getName() == null) {
                throw new IllegalStateException("User Name Cannot Be Empty");
            }
            User u =  userService.findUserByName(userRequest.getName());

            if (u == null) {
                return new ResponseEntity<>(u, HttpStatus.OK);
            } else {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findUserByEmail")
    public ResponseEntity<User> findUserByEmail(@RequestBody UserRequest userRequest){
        try {
            User user = userService.findUserByEmail(userRequest.getEmail());
            if(user != null){
                return new ResponseEntity<>(user, HttpStatus.OK);
            } else {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findUserById")
    public ResponseEntity<User> findUserById(@RequestBody UserRequest userRequest){
        try {
            User user = userService.findUserById(userRequest.getId());
//            List<Review> reviews = reviewRepository.findReviewsByReviewer(user);
//            user.setReviews(reviews);
            if(user != null){
                for (Review r: user.getReviews()){
                    r.setReviewer(null);
                }
                return new ResponseEntity<>(user, HttpStatus.OK);
            } else {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping(value = "/updateUserIcon/{userId}", consumes = MediaType.ALL_VALUE, produces = MediaType.ALL_VALUE)
    public ResponseEntity<String> updateUserIcon(@PathVariable String userId, @RequestBody MultipartFile file) {
        try {
            userService.updateUserIcon(userId, file);
            return new ResponseEntity<>("Successfully uploaded", HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
