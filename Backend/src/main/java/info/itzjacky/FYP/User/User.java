package info.itzjacky.FYP.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import info.itzjacky.FYP.Auth.Token;
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
@Table(name = "User", indexes = {
        @Index(name = "idx_user_name", columnList = "name")
})
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

    @Column(columnDefinition = "boolean default false")
    private Boolean isPrivate;

    @Column(unique = true)
//    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String resetPasswordToken;

    @Column(unique = true)
//    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Date resetPasswordExpires;

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

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonIgnore
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Token> tokens;

    @ManyToMany(mappedBy = "developers")
    @ToString.Exclude
    private List<Game> developedGames;

    @OneToMany(mappedBy = "reviewer", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Review> reviews;

    @Column(insertable = true, updatable = true)
    private String iconUrl;

    @ManyToMany(mappedBy = "Tester")
    @ToString.Exclude
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
