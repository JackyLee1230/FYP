package info.itzjacky.FYP.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Review.Review;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
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
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = true, updatable = true)
    private Integer id;

    @Column(unique = true)
    private String name;

    @Column(updatable = true, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(updatable = true)
    private String password;

    private String joinDate;

    private Date lastActive;

    @Column(columnDefinition = "integer default 0")
    private Integer numOfReviews;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private List<Role> role;

    @ManyToMany(mappedBy = "developers")
    private List<Game> developedGames;

    @OneToMany(mappedBy = "reviewer")
    @JsonIgnore
    private List<Review> reviews;

    @ManyToMany(mappedBy = "Tester")
    private List<Game> testedGames;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
//        for each role in the list of roles, create a new SimpleGrantedAuthority object

        ArrayList<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (Role r : role) {
            authorities.add(new SimpleGrantedAuthority(r.name()));
        }
        return authorities;
    }

    @Override
    public String getUsername() {
        return name;
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
