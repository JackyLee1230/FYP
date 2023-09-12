package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.Game.Game;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
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

    private Integer Tester;

    @ManyToOne
    @JoinColumn(name = "game_id", referencedColumnName = "id")
    private Game reviewedGame;

    private Integer sentiment;

    private Date sentimentUpdatedAt;
}
