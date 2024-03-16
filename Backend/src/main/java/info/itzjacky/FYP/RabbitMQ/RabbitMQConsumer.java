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
import java.util.Objects;

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

        if (reviewId == null || sentiment == null) {
            logger.warn("Sentiment got back with Non Existent Review ID: " + payload);
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

    @Transactional
    @RabbitListener(queues = "${spring.rabbitmq.TopicModelingResultQueueName}")
    public void receiveTopicModelling(String payload, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag)
            throws IOException {
        logger.info("Received Payload: " + payload);
//        given a json string is received, it is converted to a json object
        JSONObject jsonObject = new JSONObject(payload.replace("b'", "").replace("b\"", ""));
        Integer reviewId = jsonObject.getInt("reviewId");
        JSONObject bert = jsonObject.getJSONObject("BERT");
        JSONObject llm = jsonObject.getJSONObject("LLM");

        String llmSummary = llm.getString("summary");
        llm.remove("summary"); // remove summary, only leave aspects in LLM JSON

        Review review = reviewRepository.findReviewById(reviewId);
        if (review == null) {
            logger.warn("Topic Modelling got back with Non Existent Review ID: " + reviewId);
            channel.basicNack(tag, false, true);
            return;
        } else {
            review.setTopics(bert.toString());
            review.setAspects(llm.toString());
            review.setSummary(llmSummary);
            reviewRepository.save(review);
            channel.basicAck(tag, false);
        }
        channel.basicAck(tag, false);
    }

}

