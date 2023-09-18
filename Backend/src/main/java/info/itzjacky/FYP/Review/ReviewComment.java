package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.User.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Table
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "commenter_id")
    public User commenter;

    @CreationTimestamp
    public Date createdAt;

    @UpdateTimestamp
    public Date updatedAt;

    @ManyToOne
    @JoinColumn(name = "review_id")
    public Review review;

    @Column(length = 10000)
    private String comment;


}
