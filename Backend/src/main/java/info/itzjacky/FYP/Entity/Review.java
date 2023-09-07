package info.itzjacky.FYP.Entity;

import jakarta.persistence.*;
import lombok.*;

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
    private Integer reviewId;

//    @ManyToOne
//    @JoinColumn(name="reviewReviewer")
//    private User reviewer;

    private String reviewDate;

    private Integer gameId;

    private String publisher;

    private Float score;

    private Float recommendationScore;

    private String comment;

    private Integer Tester;
}
