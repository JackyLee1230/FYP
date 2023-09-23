package info.itzjacky.FYP.RabbitMQ;

import com.rabbitmq.client.Channel;
import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.Review.ReviewRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Base64;

@Service
public class RabbitMQConsumer {


    @Value("${spring.rabbitmq.SentimentAnalysisQueueName}")
    private String queueName;

    @Autowired
    ReviewRepository reviewRepository;

    Logger logger = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @Transactional
    @RabbitListener(queues = "${spring.rabbitmq.SentimentAnalysisResultQueueName}")
    public void receive(String payload, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag)
           throws IOException {
        logger.info("Sentiment Analysis RESULT: Review ID: " + payload.split(";")[0].replace("b'", "") + " Sentiment: " + payload.split(";")[1]);
        Review review = reviewRepository.findReviewById(Integer.valueOf(payload.split(";")[0].replace("b'", "")));
        if(review == null){
            logger.warn("Sentiment got back with Non Existent Review ID: " + payload.split(";")[0].replace("b'", ""));
            return;
        } else {
            review.setSentiment(Integer.valueOf(payload.split(";")[1].replace("'", "")));
            reviewRepository.save(review);
        }
        channel.basicAck(tag, false);
    }

}

