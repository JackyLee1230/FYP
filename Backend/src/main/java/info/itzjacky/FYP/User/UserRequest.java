package info.itzjacky.FYP.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Review.Review;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserRequest {
    private Integer id;
    private String name;
    private String email;
    private String password;
    private String joinDate;
    private Date lastActive;
    private Integer numOfReviews;
    private List<Role> role;
    private List<Game> developedGames;
    private List<Review> reviews;
    private List<Game> testedGames;
    private String resetPasswordToken;
    private Date resetPasswordExpires;
    private String verificationToken;

    private Integer favourite;
    private Integer wishlist;


}
