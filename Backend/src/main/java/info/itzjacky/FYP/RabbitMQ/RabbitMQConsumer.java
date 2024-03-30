package info.itzjacky.FYP.RabbitMQ;

import com.rabbitmq.client.Channel;
import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameRepository;
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

    @Autowired
    GameRepository gameRepository;

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

        Boolean isSpam = llm.getBoolean("isSpam");
        Integer tokenUsed = null;
        String llmSummary = null;
        if (isSpam == false && !Objects.equals(llm.get("summary").toString(), "null")) {
            llmSummary = llm.getString("summary");
        }
//        extract tokenUsageBreakdown from llm
        JSONObject tokenUsageBreakdown = llm.getJSONObject("tokenUsageBreakdown");
        if (tokenUsageBreakdown != null) {
            tokenUsed = tokenUsageBreakdown.getInt("total_tokens");
        }

        llm.remove("summary"); // remove summary, only leave aspects in LLM JSON
        llm.remove("tokenUsageBreakdown");

        Review review = reviewRepository.findReviewById(reviewId);
        if (review == null) {
            logger.warn("Topic Modelling got back with Non Existent Review ID: " + reviewId);
            channel.basicNack(tag, false, true);
            return;
        } else {
            review.setTopics(bert.toString());
            review.setAspects(llm.toString());
            review.setSummary(llmSummary);
            review.setIsSpam(isSpam);
            if (tokenUsed != null) {
                if (review.getTokenUsed() != null) {
                    review.setTokenUsed(review.getTokenUsed() + tokenUsed);
                } else {
                    review.setTokenUsed(tokenUsed);
                }
            }
            reviewRepository.save(review);
            channel.basicAck(tag, false);
        }
        channel.basicAck(tag, false);
    }

    @Transactional
    @RabbitListener(queues = "${spring.rabbitmq.AggregatedReviewResultQueueName}")
    public void receiveAggregatedReview(String payload, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag)
            throws IOException {
        logger.info("Received Aggregated Review Payload: " + payload);
        JSONObject jsonObject = new JSONObject(payload.replace("b'", "").replace("b\"", ""));
        Integer gameId = jsonObject.getInt("gameId");

        String tldr = null;
        if (!Objects.equals(jsonObject.get("tldr").toString(), "null")) {
            tldr = jsonObject.getString("tldr");
        }

        Game game = gameRepository.findGameById(gameId);
        if (game == null) {
            logger.warn("Game Aggregated got back with Non Existent Game ID: " + gameId);
            channel.basicNack(tag, false, true);
            return;
        } else {
            game.setAggregatedReview(tldr);
            game.setAggregatedReviewUpdatedAt(new java.util.Date());
            gameRepository.save(game);
            channel.basicAck(tag, false);
        }
        channel.basicAck(tag, false);
    }

}

