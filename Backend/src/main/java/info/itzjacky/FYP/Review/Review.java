package info.itzjacky.FYP.Review;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.Game.Game;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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
//@Table(uniqueConstraints = { @UniqueConstraint(name = "UniqueReviewerAndReviewedGame", columnNames = { "reviewer_id", "game_id" }) })
//    a column that stores the game version, game has a one to many attribute call versions
//    make this into the unique constraint
@Table(uniqueConstraints = { @UniqueConstraint(name = "UniqueReviewerAndReviewedGame", columnNames = { "reviewer_id", "game_id", "gameVersion" }) })
public class Review {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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

    @OneToMany(mappedBy = "review")
    private List<ReviewComment> reviewComment;
}

