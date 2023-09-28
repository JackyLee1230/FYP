package info.itzjacky.FYP.Game;

import com.fasterxml.jackson.annotation.JsonIgnore;
import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.User.Role;
import info.itzjacky.FYP.User.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.List;
import java.util.Objects;

@Entity
@Table(uniqueConstraints = { @UniqueConstraint(name = "UniqueGameNameAndDeveloper", columnNames = { "name", "developerCompany" }) })
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@RequiredArgsConstructor
public class Game {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = true, updatable = true)
    private Integer id;
    @NonNull
    private String name;
    @Column(insertable = true, updatable = true)
    private String iconUrl;
    private String description;
    private String releaseDate;
    @ManyToMany
    @JoinTable(
            name = "game_developers",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private List<User> developers;
    private boolean isInDevelopment;
    private String developerCompany;
    private String publisher;
    private Float score;
    private Float recommendationScore;
    @ManyToMany
    @JoinTable(
            name = "game_testers",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private List<User> Tester;

    @OneToMany(mappedBy = "reviewedGame")
    @JsonIgnore
    private List<Review> gameReviews;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<GameGenre> genre;

    @OneToMany(mappedBy = "versionedGame")
    private List<GameVersion> versions;

    private String version;
    @ElementCollection
    private List<String> platforms;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Game game = (Game) o;
        return getId() != null && Objects.equals(getId(), game.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
