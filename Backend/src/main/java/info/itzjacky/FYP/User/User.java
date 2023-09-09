package info.itzjacky.FYP.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Review.Review;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Table
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@RequiredArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @NonNull
    @Column(insertable = true, updatable = true)
    private Integer id;

    @Column(unique = true)
    private String name;

    @Column(updatable = true, unique = true)
    private String email;

    @Column(updatable = true)
    @JsonIgnore
    private String password;

    private String joinDate;

    private Date lastActive;

    private Integer numOfReviews;

    @ElementCollection(targetClass = Role.class)
    @Enumerated(EnumType.STRING)
    private List<Role> role;

    @ManyToMany(mappedBy = "developers")
    private List<Game> developedGames;

    @OneToMany(mappedBy = "reviewer")
    @JsonIgnore
    private List<Review> reviews;

    @ManyToMany(mappedBy = "Tester")
    private List<Game> testedGames;

}
