package info.itzjacky.FYP.Review;

import info.itzjacky.FYP.User.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment,Integer>{

    ReviewComment findReviewCommentById(Integer id);

    List<ReviewComment> findReviewCommentsByCommenter(User commenter);

    List<ReviewComment> findReviewCommentsByReview(Review review);
}
