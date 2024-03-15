package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameGenre;
import info.itzjacky.FYP.Game.Platform;
import info.itzjacky.FYP.User.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Base64;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ReviewRequest {

    private Integer reviewId;

    private Integer reviewerId;

    private Integer likerId;

    private Reaction reaction;

    private Float score;

    private Boolean recommended;

    private String comment;

    private Integer gameId;

    private String gameVersion;

    private Integer numberOfReviews;

    private Integer sentiment;

    private Integer reviewsPerPage;

    private Integer pageNum;

    private Integer playTime;

    private Platform platform;

    private Boolean isPositive;

    private Boolean isSponsored;

    private String sortBy;

    private List<Integer> resentSentimentId;

    private String order;

    private String createdAt;

    private List<GameGenre> genres;

    private String gameName;

    private String gameDescription;


}
