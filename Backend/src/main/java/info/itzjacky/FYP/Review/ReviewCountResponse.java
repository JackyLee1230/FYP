package info.itzjacky.FYP.Review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ReviewCountResponse {

        private Integer numberOfReviews;
        private Integer numberOfPositiveReviews;
        private Integer numberOfNegativeReviews;
        private Integer numberOfNeutralReviews;
}
