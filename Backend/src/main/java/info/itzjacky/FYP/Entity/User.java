package info.itzjacky.FYP.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Date;
import java.util.List;
import java.util.Objects;

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
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @NonNull
    private Integer id;

    @Column(unique = true)
    private String name;

    @Column(updatable = true, unique = true)
    private String email;

    @Column(updatable = true)
    private String password;

    private String joinDate;

    private Date lastActive;

    private Integer numOfReviews;

    private Role role;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name="user_developedGames")
    private List<Game> developedGames;

    @OneToMany
    @JoinColumn(name="user_Reviews")
    private List<Review> reviews;

}
