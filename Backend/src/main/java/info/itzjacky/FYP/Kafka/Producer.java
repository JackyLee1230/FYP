package info.itzjacky.FYP.Kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class Producer {
    private final KafkaTemplate kafkaTemplate;

    @Bean
    public NewTopic SentimentAnalysisTopic(){
        return new NewTopic("SentimentAnalysis", 1, (short) 1);
    }

    @Value("SentimentAnalysis")
    private String topic;

    Producer(KafkaTemplate kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(KafkaMessage message) {
        this.kafkaTemplate.send(topic, message.getMessage());
        System.out.println("Sent sample message [" + message + "] to " + topic);
    }
}