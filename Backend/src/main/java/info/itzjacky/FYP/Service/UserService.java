package info.itzjacky.FYP.Service;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Entity.User;
import info.itzjacky.FYP.Repository.GameRepository;
import info.itzjacky.FYP.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    Logger logger = LoggerFactory.getLogger(UserService.class);

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User addUser(User user){
        logger.info(user.toString());
        try{
            userRepository.save(user);
            return user;
        }catch (Exception e){
            throw new IllegalStateException("User Already Exists");
        }
    }

    public Optional<User> findUserByEmail(String email){
        return userRepository.findUserByEmail(email);
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
