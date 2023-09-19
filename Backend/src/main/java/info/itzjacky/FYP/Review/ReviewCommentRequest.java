package info.itzjacky.FYP.Review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ReviewCommentRequest {

    private Integer id;

    private Integer commenterId;

    private Integer reviewId;

    private String comment;

}
