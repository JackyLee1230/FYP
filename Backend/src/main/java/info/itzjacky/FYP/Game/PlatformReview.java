package info.itzjacky.FYP.Game;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Data
@Setter
public class PlatformReview {
    Platform platform;
    Integer reviewCount;
    Double average;
}
