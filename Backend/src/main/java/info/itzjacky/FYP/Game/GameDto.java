package info.itzjacky.FYP.Game;

import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.User.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.*;

import java.util.Date;
import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@RequiredArgsConstructor
public class GameDto {

    @NonNull
    private Integer id;

    private String name;

}
