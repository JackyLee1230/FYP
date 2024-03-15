package info.itzjacky.FYP.RabbitMQ;

import com.rabbitmq.client.Channel;
import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.Review.ReviewRepository;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
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
        if(payload.contains("TESTMESSAGE")){
            logger.info("TEST MESSAGE RECEIVED" + payload);
            channel.basicAck(tag, false);
            return;
        }

        logger.info("Received Payload: " + payload);
//        given a json string is received, it is converted to a json object
        JSONObject jsonObject = new JSONObject(payload.replace("b'", "").replace("b\"", ""));
        Integer rId = jsonObject.getInt("reviewId");
        String reviewId = rId.toString();
        Integer sentiment = jsonObject.getInt("sentiment");

//        String result = payload.replace("b\"", "").replace("b'", "");
//        String reviewId = result.contains(";") ? result.substring(0, result.indexOf(";")) : null;
//        String sentiment = result.contains(";") ? result.substring(result.indexOf(";") + 1) : null;
        if (reviewId == null || sentiment == null) {
            logger.warn("Sentiment got back with Non Existent Review ID: " + payload);
//            acknowledge the message and remove it from the queue
            channel.basicNack(tag, false, true);
            return;
        }
        if(Integer.parseInt(reviewId) < 0) {
            logger.warn("Sentiment got back with Non Existent Review ID: " + reviewId);
            channel.basicNack(tag, false, true);
            return;
        }
        logger.info("Sentiment Analysis RESULT: Review ID: " + reviewId + " Sentiment: " + sentiment);
        Review review = reviewRepository.findReviewById(Integer.valueOf(reviewId));
        if (review == null) {
            logger.warn("Sentiment got back with Non Existent Review ID: " + reviewId);
            channel.basicNack(tag, false, true);
            return;
        } else {
            review.setSentiment(Integer.valueOf(sentiment));
            review.setSentimentUpdatedAt(new java.util.Date());
            reviewRepository.save(review);
        }
        channel.basicAck(tag, false);
    }

//    @Transactional
//    @RabbitListener(queues = "${spring.rabbitmq.TopicModelingResultQueueName}")
//    public void receiveTopicModelling(String payload, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag)
//            throws IOException {
//        String result = payload.replace("b'", "");
//        logger.info("Topic Modelling RESULT: " + result);
//        channel.basicAck(tag, false);
//    }

}

