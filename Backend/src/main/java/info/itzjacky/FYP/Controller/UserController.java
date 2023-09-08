package info.itzjacky.FYP.Controller;

import info.itzjacky.FYP.Entity.User;
import info.itzjacky.FYP.Service.UserService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/getAllUser")
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @PostMapping("/addUser")
    public User addUser(@RequestBody User user){
        try{
            return userService.addUser(user);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/removeUser")
    public void removeUser(@RequestBody User user){
        userService.removeUser(user);
    }

    @PostMapping("/removeUserByBane")
    public void removeUserByName(@RequestBody User user){

        userService.removeUserByName(user);
    }

    @PostMapping("/findUserByName")
    public Optional<User> findUserByName(@RequestParam("name") String name){
        Optional<User> u =  userService.findUserByName(name);
        if(u.isPresent()){
            return u;
        } else {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
        }
    }

    @PostMapping("/findUserByEmail")
    public Optional<User> findUserByEmail(@RequestParam("email") String email){
        System.out.println(email  + "is here ");
        Optional<User> user = userService.findUserByEmail(email);
        if(user.isPresent()){
            return user;
        } else {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User Not Found");
        }
    }
}
