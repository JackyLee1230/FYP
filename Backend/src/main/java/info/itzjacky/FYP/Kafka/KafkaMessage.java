package info.itzjacky.FYP.Kafka;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class KafkaMessage {
    private final Integer id;

    private final String message;

    @JsonCreator
    public KafkaMessage(
            @JsonProperty("id") Integer id,
            @JsonProperty("message")  String message)
    {
        this.id = id;
        this.message = message;
    }


}
