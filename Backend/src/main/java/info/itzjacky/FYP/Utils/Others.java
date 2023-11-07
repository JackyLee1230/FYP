package info.itzjacky.FYP.Utils;

import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import java.security.Principal;

public class Others {

    static UserService userService;

    public static int booleanToInt(boolean bool){
        return bool ? 1 : 0;
    }

    public static boolean intToBoolean(int i){
        return i == 1;
    }

    public static String extractUsernameFromPrincipal(Principal principal) {
        return principal.getName();
    }
}
