package info.itzjacky.FYP.Game;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.User.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.proxy.HibernateProxy;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "Game", indexes = {
        @Index(name = "idx_game_name", columnList = "name"),
        @Index(name = "idx_game_developercompany", columnList = "developerCompany"),
        @Index(name = "idx_game_isindevelopment", columnList = "isInDevelopment"),
}, uniqueConstraints = {
        @UniqueConstraint(name = "UniqueGameNameAndDeveloper", columnNames = {"name", "developerCompany"})
})
//@JsonIdentityInfo(
//        generator = ObjectIdGenerators.PropertyGenerator.class,
//        property = "id")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@RequiredArgsConstructor
//@NamedEntityGraph(
//        name = "Game.exceptPercentile",
//        attributeNodes = {
//                @NamedAttributeNode("name"),
//                @NamedAttributeNode("id"),
//                @NamedAttributeNode("isDLC"),
//                @NamedAttributeNode("description"),
//        }
//)
public class Game {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = true, updatable = true)
    private Integer id;
    @NonNull
    private String name;
    private boolean isDLC;

    @Column(insertable = true, updatable = true, length = 10000)
    private String analytic;
    @Column(insertable = true, updatable = true)
    private Date analyticUpdatedAt;

    @Transient
    private List<Game> DLCS;
    @Transient
    private List<PlatformReview> platformReviews;
    @Transient
    private Boolean hasUserReviewed;

    private boolean isFree;
    private boolean isFullGame;
    private String legalNotice;
    private String gamePage;
    private String gamePrice;
    private String requiredAge;
    @ManyToOne
    @JoinColumn(name = "base_game_id")
    private Game BaseGame;
    @Column(insertable = true, updatable = true)
    private String iconUrl;
    @Column(insertable = true, updatable = true, length = 2000)
    private String description;
    private String releaseDate;
    @ManyToMany
    @JoinTable(
            name = "game_developers",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    @ToString.Exclude
    private List<User> developers;
    private boolean isInDevelopment;
    private String developerCompany;
    private String publisher;
    private Float score;
    @Formula("100 - (SELECT COUNT(*) FROM game g WHERE g.score > score and g.score is not null) / (SELECT COUNT(*) FROM game g where g.score is not null) * 100")
    @Basic(fetch = FetchType.LAZY)
    private Double percentile;

    private Float recommendationScore;
    @ManyToMany
    @JoinTable(
            name = "game_testers",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    @ToString.Exclude
    private List<User> Tester;

    @OneToMany(mappedBy = "reviewedGame", fetch = FetchType.LAZY)
    @ToString.Exclude
//    @JsonIgnore
    private List<Review> gameReviews;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @Column(name="genre")
    private List<GameGenre> genre;

    @OneToMany(mappedBy = "versionedGame", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<GameVersion> versions;

    private String version;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<Platform> platforms;

    @CreationTimestamp
    private Date createdAt;

    @UpdateTimestamp
    private Date updatedAt;

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
