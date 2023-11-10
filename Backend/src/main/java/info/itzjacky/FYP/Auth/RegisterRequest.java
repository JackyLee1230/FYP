package info.itzjacky.FYP.Auth;

import info.itzjacky.FYP.User.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String name;
    private String password;
    private String email;
    private Integer age;
    private String birthday;
    private Gender gender;

}
