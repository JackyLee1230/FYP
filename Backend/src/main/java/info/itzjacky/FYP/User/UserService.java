package info.itzjacky.FYP.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
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
        if(user.getName() == null || user.getEmail() == null || user.getPassword() == null){
            throw new IllegalStateException("User's Name, Email, Password cannot be null");
        }
        if(user.getRole() == null){
            user.setRole(List.of(Role.USER));
        }
        try{
            user.setNumOfReviews(0);
            user.setJoinDate(new Date().toString());
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
            userRepository.delete(userRepository.findUserById(user.getId()));
        }
    }


    public Optional<User> findUserByName(String name){
        return userRepository.findUserByName(name);
    }

}
