package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Utils.RegEx;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
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

    public User login(UserRequest userRequest) {
        try{
            Optional<User> user = userRepository.findUserByEmail(userRequest.getEmail());
            if(user.isPresent()){
                if(user.get().getPassword().equals(userRequest.getPassword())){
                    return user.get();
                } else {
                    throw new IllegalStateException("Incorrect Password");
                }
            } else {
                throw new IllegalStateException("User Does Not Exist");
            }
        }catch (Exception e){
            throw new IllegalStateException("Error Logging In");
        }
    }

    @Transactional
    public User register(UserRequest userRequest) {
        User user = null;

        try{
            user = userRepository.findUserByEmailOrName(userRequest.getEmail(), userRequest.getName());
        } catch (Exception e){
            throw new IllegalStateException("Error Checking For Existing Users");
        }

        if(!RegEx.emailValidation(userRequest.getEmail())){
            throw new IllegalStateException("Invalid Email Format");
        }

        try{
            if (user != null){
                throw new IllegalStateException("User Already Exists");
            } else {
                User newUser = new User();
                newUser.setName(userRequest.getName());
                newUser.setEmail(userRequest.getEmail());
                newUser.setPassword(userRequest.getPassword());
                newUser.setRole(List.of(Role.USER));
                newUser.setNumOfReviews(0);
                newUser.setJoinDate(new Date().toString());
                newUser.setLastActive(new Date());
                userRepository.save(newUser);
                return newUser;
            }
        } catch (Exception e){
            throw new IllegalStateException("Error Registering User");
        }
    }

    public Optional<User> findUserByEmail(String email){
        if(email == null){
            throw new IllegalStateException("Email Cannot Be Empty");
        }
        return userRepository.findUserByEmail(email);
    }

    @Transactional
    public void removeUserByName(User user){
        Optional<User> u = userRepository.findUserByName(user.getName());
        if(!u.isPresent()){
            throw new IllegalStateException("Username Does Not Exist");
        } else {
            userRepository.delete(user);
        }
    }

    @Transactional
    public void removeUser(User user){
        if(user != null){
            userRepository.delete(userRepository.findUserById(user.getId()));
        }
    }


    public Optional<User> findUserByName(String name){
        return userRepository.findUserByName(name);
    }
}
