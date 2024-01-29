package info.itzjacky.FYP.User;

import com.fasterxml.jackson.annotation.*;
import info.itzjacky.FYP.Auth.Token;
import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Review.Review;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "User", indexes = {
        @Index(name = "idx_user_name", columnList = "name"),
        @Index(name = "idx_user_id_name", columnList = "id, name"),
        @Index(name = "idx_user_email" , columnList = "email")
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
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = true, updatable = true)
    private Integer id;

    @Column(updatable = true)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String location;

    @Column(columnDefinition = "boolean default false")
    private Boolean isPrivate;

    @Column(columnDefinition = "boolean default false", updatable = true, unique = true)
    private Boolean isVerified;

    @Column()
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String resetPasswordToken;

    @Column()
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Date resetPasswordExpires;

    @Column()
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String verificationToken;

    @Column(unique = true, length = 14)
    private String name;

    @Column(updatable = true, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(updatable = true)
    private String password;

    @Column(updatable = true)
    private Date birthday;

    @Formula("(TIMESTAMPDIFF(YEAR,birthday,CURDATE()))")
    private String age;

    @Column(updatable = true)
    private String ageGroup;

    @Column(updatable = true)
    private Gender gender;

    @Column(updatable = true)
    private String joinDate;

    @Column(updatable = true)
    private Date lastActive;

    @ElementCollection(fetch = FetchType.EAGER)
    List<Integer> favouriteGames;

    @ElementCollection(fetch = FetchType.EAGER)
    List<Integer> wishlistGames;

//    @Column(columnDefinition = "integer default 0")
    @Formula("(SELECT COUNT(*) FROM review r WHERE r.reviewer_id = id)")
    private Integer numOfReviews;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private List<Role> role;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonIgnore
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Token> tokens;

    @ManyToMany(mappedBy = "developers")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private List<Game> developedGames;

    @OneToMany(mappedBy = "reviewer", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
//    cascade so if the user is deleted, the review is deleted

//    @JsonBackReference
    @ToString.Exclude
    private List<Review> reviews;

    @ManyToMany
    @ToString.Exclude
//    @JsonIgnore
    @JoinTable(
            name = "review_likes",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "review_id")
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<Review> likedReviews;

    @ManyToMany
    @ToString.Exclude
//    @JsonIgnore
    @JoinTable(
            name = "review_dislikes",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "review_id")
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<Review> dislikedReviews;

    @Formula("(SELECT COUNT(*) FROM review_likes rl WHERE rl.user_id = id)")
    private Integer numberOfLikes;

    @Formula("(SELECT COUNT(*) FROM review_dislikes rl WHERE rl.user_id = id)")
    private Integer numberOfDislikes;

    @Formula("(SELECT COUNT(*) FROM review r WHERE r.reviewer_id = id)")
    private Integer numberOfReviews;

    @Column(insertable = true, updatable = true)
    private String iconUrl;

    @Column(insertable = true, updatable = true)
    private String bannerUrl;

    @ManyToMany(mappedBy = "Tester")
    @ToString.Exclude
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<Game> testedGames;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> grantedAuthorities = new ArrayList<GrantedAuthority>();
        for (Role role : this.getRole()){
            for (SimpleGrantedAuthority authority : role.getAuthorities()){
                grantedAuthorities.add(authority);
            }
        }
        return grantedAuthorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
