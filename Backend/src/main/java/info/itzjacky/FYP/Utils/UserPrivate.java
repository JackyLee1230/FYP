package info.itzjacky.FYP.Utils;

import info.itzjacky.FYP.User.User;

public class UserPrivate {
       public static User removePrivateInfo(User user) {
           if(user.getIsPrivate() == null || !user.getIsPrivate()) {
               return user;
           }else {
               user.setEmail(null);
               user.setAge(null);
               user.setBirthday(null);
               user.setGender(null);
               user.setLocation(null);
               user.setAgeGroup(null);
               user.setLastActive(null);
               return user;
           }
       }

}
