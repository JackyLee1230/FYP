package info.itzjacky.FYP.Review;

import com.fasterxml.jackson.annotation.*;
import info.itzjacky.FYP.Game.Platform;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.Game.Game;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
//@Table(uniqueConstraints = { @UniqueConstraint(name = "UniqueReviewerAndReviewedGame", columnNames = { "reviewer_id", "game_id" }) })
//    a column that stores the game version, game has a one to many attribute call versions
//    make this into the unique constraint
@Table(name = "Review", indexes = {
        @Index(name = "idx_review_reviewer_id", columnList = "reviewer_id"),
        @Index(name = "idx_review_game_id", columnList = "game_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "UniqueReviewerAndReviewedGame", columnNames = {"reviewer_id", "game_id", "gameVersion"})
})
public class Review {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Transient
    private List<Integer> dislikedUsers;
    @Transient
    private List<Integer> likedUsers;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", referencedColumnName = "id")
    private User reviewer;

    @NonNull
    @Column(name = "created_at")
    @CreationTimestamp
    private Date createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    public Date updatedAt;

    @Column(updatable = true)
    public Integer playTime;

    @Column(updatable = true)
    @Enumerated(EnumType.STRING)
    public Platform platform;

    @Version
    private Integer version;

    private Float score;

    private boolean recommended;

    @Column(length = 10000)
    @NonNull
    private String comment;

    @ManyToOne
    @JoinColumn(name = "game_id", referencedColumnName = "id")
    @JsonIgnoreProperties("gameReviews")
    private Game reviewedGame;

    private String gameVersion;

    private Integer sentiment;

    private Date sentimentUpdatedAt;

    @ManyToMany(mappedBy = "likedReviews", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<User> likes;

    @ElementCollection
    private List<String> reviewImages;

    @Transient
    @Formula("(SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = id)")
    private Integer numberOfLikes;

    @ManyToMany(mappedBy = "dislikedReviews", fetch = FetchType.LAZY)
    @ToString.Exclude
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<User> dislikes;

    @Transient
    @Formula("(SELECT COUNT(*) FROM review_dislikes rl WHERE rl.review_id = id)")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Integer numberOfDislikes;

    @Transient
    @Formula("(SELECT COUNT(*) FROM review_comment rc WHERE rc.review_id = id)")
    private Integer numberOfComments;

    @OneToMany(mappedBy = "review", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ReviewComment> reviewComment;

    private Boolean sponsored;
}

