package info.itzjacky.FYP.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @Column(insertable = true, updatable = true)
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

    @ElementCollection(targetClass = Role.class)
    @Enumerated(EnumType.STRING)
    private List<Role> role;

    @ManyToMany(mappedBy = "developers")
    private List<Game> developedGames;

    @OneToMany(mappedBy = "reviewer")
    @JsonIgnore
    private List<Review> reviews;

}
