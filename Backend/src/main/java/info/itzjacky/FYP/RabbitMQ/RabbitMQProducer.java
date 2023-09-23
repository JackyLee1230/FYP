package info.itzjacky.FYP.RabbitMQ;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    @Value("${spring.rabbitmq.exchangeName}")
    private String exchangeName;

    @Value("${spring.rabbitmq.SentimentAnalysisRoutingKey}")
    private String SentimentAnalysisroutingKey;

    Logger logger = LoggerFactory.getLogger(RabbitMQProducer.class);

    private RabbitTemplate rabbitTemplate;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMessagetoRabbitMQ(String message) {
        logger.info("Sending message to RabbitMQ: " + message);
        rabbitTemplate.convertAndSend(exchangeName, SentimentAnalysisroutingKey, message);
    }
}
