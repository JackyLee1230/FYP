package info.itzjacky.FYP.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserService userService;

    Logger logger = LoggerFactory.getLogger(UserController.class);

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

    @PostMapping("/removeUserByBane")
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
            Optional<User> u =  userService.findUserByName(userRequest.getName());

            if (u.isPresent()) {
                return new ResponseEntity<>(u.get(), HttpStatus.OK);
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
            Optional<User> user = userService.findUserByEmail(userRequest.getEmail());
            if(user.isPresent()){
                return new ResponseEntity<>(user.get(), HttpStatus.OK);
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
            if(user != null){
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
