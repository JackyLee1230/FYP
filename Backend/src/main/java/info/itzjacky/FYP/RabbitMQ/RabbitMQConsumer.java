package info.itzjacky.FYP.RabbitMQ;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {


    @Value("${spring.rabbitmq.SentimentAnalysisQueueName}")
    private String queueName;

    Logger logger = LoggerFactory.getLogger(RabbitMQConsumer.class);

   @RabbitListener(queues = "${spring.rabbitmq.SentimentAnalysisQueueName}")
    public void receiveMessage(String message) {
        logger.info("Received message from RabbitMQ: " + message);
    }
}
