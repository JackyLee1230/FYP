package info.itzjacky.FYP.Service;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Entity.User;
import info.itzjacky.FYP.Repository.GameRepository;
import info.itzjacky.FYP.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User addUser(User user){
        try{
            userRepository.save(user);
            return user;
        }catch (Exception e){
            return null;
        }
    }

    public void removeUserByName(User user){
        Optional<User> u = userRepository.findUserByName(user.getName());
        if(!u.isPresent()){
            throw new IllegalStateException("Username Does Not Exist");
        } else {
            userRepository.delete(user);
        }
    }

    public void removeUser(User user){
        if(user != null){
            userRepository.delete(user);
        }
    }


    public Optional<User> findUserByName(String name){
        return userRepository.findUserByName(name);
    }

}
