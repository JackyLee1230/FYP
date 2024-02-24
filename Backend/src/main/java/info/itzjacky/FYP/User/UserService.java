package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Auth.AuthenticationService;
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

import java.security.Principal;
import java.util.Date;
import java.util.HashMap;
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


    public User getUserFromPrincipal(Principal principal) {
        if (principal == null || principal.getName() == null) throw new IllegalStateException("User does not exist");
        return this.findUserByEmail(principal.getName());
    }

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
            user.setIsPrivate(true);
            user.setIsVerified(false);
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
    public Boolean favourite(UserRequest userRequest) {
        if(userRequest.getId() == null || userRequest.getFavourite() == null){
            throw new IllegalStateException("User ID And Favourite ID Cannot Be Empty");
        }
        Boolean returnedBoolean = false;
        User u = userRepository.findUserById(userRequest.getId());
        if (u == null) {
            throw new IllegalStateException("User Does Not Exist");
        }
        if (u.getFavouriteGames() == null) {
            u.setFavouriteGames(List.of(userRequest.getFavourite()));
            returnedBoolean = true;
        } else {
            if (u.getFavouriteGames().contains(userRequest.getFavourite())) {
                u.getFavouriteGames().remove(userRequest.getFavourite());
                returnedBoolean = false;
            } else {
                u.getFavouriteGames().add(userRequest.getFavourite());
                returnedBoolean = true;
            }
        }
        userRepository.save(u);
        return returnedBoolean;
    }

    @Transactional
    public Boolean wishlist(UserRequest userRequest) {
        if(userRequest.getId() == null || userRequest.getWishlist() == null){
            throw new IllegalStateException("User ID And Wishlist ID Cannot Be Empty");
        }
        Boolean returnedBoolean = false;
        User u = userRepository.findUserById(userRequest.getId());
        if (u == null) {
            throw new IllegalStateException("User Does Not Exist");
        }
        if (u.getWishlistGames() == null) {
            u.setWishlistGames(List.of(userRequest.getWishlist()));
            returnedBoolean = true;
        } else {
            if (u.getWishlistGames().contains(userRequest.getWishlist())) {
                u.getWishlistGames().remove(userRequest.getWishlist());
                returnedBoolean = false;
            } else {
                u.getWishlistGames().add(userRequest.getWishlist());
                returnedBoolean = true;
            }
        }
        userRepository.save(u);
        return returnedBoolean;
    }

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
        if (u == null) {
            throw new IllegalStateException("Token Has Expired");
        }
        Date d = u.getResetPasswordExpires();
        if (d != null && d.before(new Date())) {
            throw new IllegalStateException("Token Has Expired");
        }
        u.setReviews(null);
        return u;
    }

    /*
    * get the user using the verification token, and then set the user's isVerified to true
     */
    @Transactional
    public User getUserByVerificationToken(String token){
        if(token == null){
            throw new IllegalStateException("Token Cannot Be Empty");
        }
        User u = userRepository.findUserByVerificationToken(token);
        if (u == null) {
            throw new IllegalStateException("Invalid Verification Token");
        }
        u.setIsVerified(Boolean.TRUE);
        userRepository.save(u);
        u.setReviews(null);
        u.setVerificationToken(null);
        return u;
    }

    public User updatePassword(User user, String newPassword) {
        if(!RegEx.passwordValidation(newPassword)){
            throw new IllegalStateException("Password Must Be 8-16 Characters Long, Contain At Least 1 Letter And 1 Number");
        }
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
        User u = userRepository.findUserByName(user.getName());
        if(u == null){
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

    public User findUserByName(String name){
        User u = userRepository.findUserByName(name);
        if (u == null) {
            throw new IllegalStateException("User Does Not Exist");
        }else {
            return u;
        }
    }

    @Transactional
    public void updateUserIcon(String userId, MultipartFile file) {
        User user = userRepository.findUserById(Integer.parseInt(userId));
        if (file == null) throw new IllegalStateException("File Cannot Be Empty");
        String newFileName = null;
        if (user.getIconUrl() != null && user.getIconUrl().endsWith("icon.jpg")) {
            storageService.uploadFile("users/" + user.getId() + "/icon-2.jpg", file);
            storageService.deleteFile(user.getIconUrl());
            user.setIconUrl("users/" + user.getId() + "/icon-2.jpg");
        } else if (user.getIconUrl() != null) {
            String[] split = user.getIconUrl().split("-");
            int num = Integer.parseInt(split[split.length - 1].replace(".jpg", "")) + 1;
            newFileName = "users/" + user.getId() + "/icon-" + num + ".jpg";
            storageService.uploadFile(newFileName, file);
            storageService.deleteFile(user.getIconUrl());
            user.setIconUrl(newFileName);
        }

        if (user.getIconUrl() == null) {
            storageService.uploadFile("users/" + user.getId() + "/icon.jpg", file);
            user.setIconUrl("users/" + user.getId() + "/icon.jpg");
        }

        userRepository.save(user);
    }

    @Transactional
    public void updateUserBanner(String userId, MultipartFile file) {
        User user = userRepository.findUserById(Integer.parseInt(userId));
        if (file == null) throw new IllegalStateException("File Cannot Be Empty");
        String newFileName = null;
        if (user.getBannerUrl() != null && user.getBannerUrl().endsWith("banner.jpg")) {
            storageService.uploadFile("users/" + user.getId() + "/banner-2.jpg", file);
            storageService.deleteFile(user.getBannerUrl());
            user.setBannerUrl("users/" + user.getId() + "/banner-2.jpg");
        } else if (user.getBannerUrl() != null) {
            String[] split = user.getBannerUrl().split("-");
            int num = Integer.parseInt(split[split.length - 1].replace(".jpg", "")) + 1;
            newFileName = "users/" + user.getId() + "/banner-" + num + ".jpg";
            storageService.uploadFile(newFileName, file);
            storageService.deleteFile(user.getBannerUrl());
            user.setBannerUrl(newFileName);
        }

        if (user.getBannerUrl() == null) {
            storageService.uploadFile("users/" + user.getId() + "/banner.jpg", file);
            user.setBannerUrl("users/" + user.getId() + "/banner.jpg");
        }
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

    @Transactional
    public User updateUsername(UserRequest userRequest) {
        if(userRequest.getName() == null || userRequest.getName().isEmpty() || userRequest.getId() == null){
            throw new IllegalStateException("Username Cannot Be Empty");
        }
//        check username against regex
        if(!RegEx.usernameValidation(userRequest.getName())){
            throw new IllegalStateException("Username Must Be 4-14 Characters Long, With no Space and @ Symbol");
        }

//        find other users with the same username
        User userWithNewName = userRepository.findUserByName(userRequest.getName());

        if (userWithNewName != null) {
            throw new IllegalStateException("Username Already Taken");
        }

        User u = userRepository.findUserById(userRequest.getId());
        u.setName(userRequest.getName());
        userRepository.save(u);
        return u;
    }
}
