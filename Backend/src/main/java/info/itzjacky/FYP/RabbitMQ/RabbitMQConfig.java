package info.itzjacky.FYP.RabbitMQ;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${spring.rabbitmq.SentimentAnalysisQueueName}")
    private String queueName;

    @Value("${spring.rabbitmq.TopicModelingQueueName}")
    private String TopicModelingQueueName;

    @Value("${spring.rabbitmq.exchangeName}")
    private String exchangeName;

    @Value("${spring.rabbitmq.SentimentAnalysisRoutingKey}")
    private String SentimentAnalysisroutingKey;

    @Value("${spring.rabbitmq.TopicModelingRoutingKey}")
    private String TopicModelingroutingKey;

    @Bean
    public Queue queue() {
        return new Queue(queueName);
    }

    @Bean
    public Queue TopicQueue() {
        return new Queue(TopicModelingQueueName);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName, true, false);
    }

//    @Bean
//    public Binding binding() {
//        return BindingBuilder
//                .bind(queue())
//                .to(exchange())
//                .with(SentimentAnalysisroutingKey);
//    }

    @Bean
    public Declarables bindings() {

        return new Declarables(
                BindingBuilder
                        .bind(queue())
                        .to(exchange())
                        .with(SentimentAnalysisroutingKey)
                        ,
                BindingBuilder
                        .bind(TopicQueue())
                        .to(exchange())
                        .with(TopicModelingroutingKey)
                        );
    }


}
