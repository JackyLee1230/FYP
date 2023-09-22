package info.itzjacky.FYP.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<UserDto> addUser(@RequestBody User user){
        try{
            return new ResponseEntity<>(UserMapper.INSTANCE.userToUserDTO(userService.addUser(user)), HttpStatus.OK);
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
    public ResponseEntity<UserDto> findUserByName(@RequestParam("name") String name){
        try {
            Optional<User> u =  userService.findUserByName(name);

            if (u.isPresent()) {
                return new ResponseEntity<>(UserMapper.INSTANCE.userToUserDTO(u.get()), HttpStatus.OK);
            } else {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findUserByEmail")
    public ResponseEntity<UserDto> findUserByEmail(@RequestBody UserRequest userRequest){
        try {
            Optional<User> user = userService.findUserByEmail(userRequest.getEmail());
            if(user.isPresent()){
                return new ResponseEntity<>(UserMapper.INSTANCE.userToUserDTO(user.get()), HttpStatus.OK);
            } else {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
