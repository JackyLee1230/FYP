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
@RequiredArgsConstructor
public class UserDto {

    @Id
    @NonNull
    private Integer id;

    private Boolean isPrivate;

    private String name;

    private String email;

    private String joinDate;

    private Date lastActive;

    private Integer numOfReviews;

    @Enumerated(EnumType.STRING)
    private List<Role> role;

    private List<Game> developedGames;

    private List<Review> reviews;

    private String iconUrl;

}
