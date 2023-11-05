package info.itzjacky.FYP.Utils;

import java.util.regex.Pattern;

public class RegEx {

// Helper function for checking RegEx
    public static boolean patternMatches(String emailAddress, String regexPattern) {
        return Pattern.compile(regexPattern)
                .matcher(emailAddress)
                .matches();
    }

    public static boolean passwordValidation(String password) {
        String regexPattern = "/^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{8,16}$/";
        return RegEx.patternMatches(password, regexPattern);
    }

    public static boolean urlValidation(String url){
        String regexPattern = "(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,})";
        return RegEx.patternMatches(url, regexPattern);
    }


//    validate the email address format
    public static boolean emailValidation(String email) {
        String regexPattern = "^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";
        return RegEx.patternMatches(email, regexPattern);
    }
}
