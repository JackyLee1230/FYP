package info.itzjacky.FYP.Controller;

import info.itzjacky.FYP.Entity.User;
import info.itzjacky.FYP.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
        return userService.addUser(user);
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
    public Optional<User> findUserByName(@RequestBody User user){
        return userService.findUserByName(user.getName());
    }
}
