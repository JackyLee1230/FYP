package info.itzjacky.FYP.Utils;

import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import java.security.Principal;
import java.util.List;

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

    public static String getAgeGroupFromAge(Integer age) {
        String[] ageGroups = new String[] { "13-19", "20-29", "30-39", "40-49", "50-59", "60-69",
                "70-79", "80-89", "90-99" };
        for (String ageGroup : ageGroups) {
            String[] ageRange = ageGroup.split("-");
            if (age >= Integer.parseInt(ageRange[0]) && age <= Integer.parseInt(ageRange[1])) {
                return ageGroup;
            }
        }
        return "NA";
    }
}
