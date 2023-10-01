package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.User.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Base64;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ReviewRequest {

    private Integer reviewId;

    private Integer reviewerId;

    private Float score;

    private boolean recommended;

    private String comment;

    private Integer gameId;

    private String gameVersion;

    private Integer numberOfReviews;
}
