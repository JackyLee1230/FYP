package info.itzjacky.FYP.Game;

import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.User.User;
import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GameRequest {
    private Integer id;
    private String name;
    private boolean isDLC;
    private boolean isFree;
    private boolean isFullGame;
    private String legalNotice;
    private String gamePage;
    private String gamePrice;
    private String requiredAge;
    private String description;
    private String releaseDate;
    private List<User> developers;
    private boolean isInDevelopment;
    private String developerCompany;
    private String publisher;
    private Float score;
    private Float recommendationScore;
    private List<User> Tester;
    private List<Review> gameReviews;
    private List<GameGenre> genre;
    private String version;
    private List<String> versions;
    private List<Platform> platforms;
    private GameVersion gameVersion;
    private Integer numOfGames;
    private Integer pageNum;
    private Integer gamesPerPage;
}
