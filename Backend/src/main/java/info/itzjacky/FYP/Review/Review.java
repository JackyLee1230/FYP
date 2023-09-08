package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.Game.Game;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "reviewer_id", referencedColumnName = "id")
    private User reviewer;

    @NonNull
    @Column(name = "created_at")
    @CreationTimestamp
    private String createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    public Date updatedAt;

    @Version
    private Integer version;

    private String publisher;

    private Float score;


    private boolean recommended;

    @Column(length = 10000)
    @NonNull
    private String comment;

    private Integer Tester;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "game_id", referencedColumnName = "id")
    private Game reviewedGame;
}
