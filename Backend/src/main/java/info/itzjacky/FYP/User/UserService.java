package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Storage.DigitalOceanStorageService;
import info.itzjacky.FYP.Utils.RegEx;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    DigitalOceanStorageService storageService;

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
        }else {
            for (Role role : user.getRole()) {
                if (!role.getAllRoles().contains(role)) {
                    throw new IllegalStateException("Invalid Role");
                }
            }
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

    public User findUserById(Integer id){
        if(id == null){
            throw new IllegalStateException("User ID Cannot Be Empty");
        }
        return userRepository.findUserById(id);
    }

//    public User login(UserRequest userRequest) {
//        try{
//            Optional<User> user = userRepository.findUserByEmail(userRequest.getEmail());
//            if(user.isPresent()){
//                if(user.get().getPassword().equals(userRequest.getPassword())){
//                    return user.get();
//                } else {
//                    throw new IllegalStateException("Incorrect Password");
//                }
//            } else {
//                throw new IllegalStateException("User Does Not Exist");
//            }
//        }catch (Exception e){
//            throw new IllegalStateException("Error Logging In");
//        }
//    }

//    @Transactional
//    public User register(UserRequest userRequest) {
//        User user = null;
//
//        try{
//            user = userRepository.findUserByEmailOrName(userRequest.getEmail(), userRequest.getName());
//        } catch (Exception e){
//            throw new IllegalStateException("Error Checking For Existing Users");
//        }
//
//        if(!RegEx.emailValidation(userRequest.getEmail())){
//            throw new IllegalStateException("Invalid Email Format");
//        }
//
//        try{
//            if (user != null){
//                throw new IllegalStateException("User Already Exists");
//            } else {
//                User newUser = new User();
//                newUser.setName(userRequest.getName());
//                newUser.setEmail(userRequest.getEmail());
//                newUser.setPassword(userRequest.getPassword());
//                newUser.setRole(List.of(Role.USER));
//                newUser.setNumOfReviews(0);
//                newUser.setJoinDate(new Date().toString());
//                newUser.setLastActive(new Date());
//                userRepository.save(newUser);
//                return newUser;
//            }
//        } catch (Exception e){
//            throw new IllegalStateException("Error Registering User");
//        }
//    }

    @Transactional
    public void updateResetPasswordToken(String token, String email){
        if(token == null || email == null){
            throw new IllegalStateException("Token And Email Cannot Be Empty");
        }
        User user = userRepository.findUserByEmail(email);
        if(user == null){
            throw new IllegalStateException("User Does Not Exist");
        }
        user.setResetPasswordToken(token);
        userRepository.save(user);
    }

    public User getUserByResetPasswordToken(String token){
        if(token == null){
            throw new IllegalStateException("Token Cannot Be Empty");
        }
        User u = userRepository.findUserByResetPasswordToken(token);
        Date d = u.getResetPasswordExpires();
        if (d != null && d.before(new Date())) {
            throw new IllegalStateException("Token Has Expired");
        }
        u.setReviews(null);
        return u;
    }

    public User updatePassword(User user, String newPassword) {
        if(user == null || newPassword == null){
            throw new IllegalStateException("User And New Password Cannot Be Empty");
        }
//        check if decrypted password is equal to new password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalStateException("New Password Cannot Be The Same As Old Password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);
        user.setReviews(null);
        user.setPassword(null);
        return user;
    }

    public User findUserByEmail(String email){
        if(email == null){
            throw new IllegalStateException("Email Cannot Be Empty");
        }
        User u = userRepository.findUserByEmail(email);
        if (u == null) {
            throw new IllegalStateException("User Does Not Exist");
        }
        return u;
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

    @Transactional
    public void updateUserIcon(String userId, MultipartFile file) {
        User user = userRepository.findUserById(Integer.parseInt(userId));

        if(user.getIconUrl() != null){
            storageService.deleteFile("users/" + user.getId() + "/icon.jpg");
        }
        storageService.uploadFile("users/" + user.getId() + "/icon.jpg", file);
        user.setIconUrl("users/" + user.getId() + "/icon.jpg");
        userRepository.save(user);
    }

    @Transactional
    public User togglePrivate(UserRequest userRequest) {
        if(userRequest.getId() == null){
            throw new IllegalStateException("User ID Cannot Be Empty");
        }
        User user = userRepository.findUserById(userRequest.getId());
        if (user == null){
            throw new IllegalStateException("User Does Not Exist");
        }

        if (user.getIsPrivate() == null) {
            user.setIsPrivate(true);
        } else {
            user.setIsPrivate(!user.getIsPrivate());
        }
        userRepository.save(user);
        return user;
    }
}
