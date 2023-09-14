package info.itzjacky.FYP;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.IntegerSerializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.apache.coyote.ajp.AbstractAjpProtocol;
import org.springframework.core.env.Environment;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class FypApplication {

	@Autowired
	private Environment env;


	public static void main(String[] args) {
		SpringApplication.run(FypApplication.class, args);
	}

	// https://medium.com/geekculture/turn-your-raspberry-pi-into-a-server-to-run-your-java-spring-mvc-app-862214279587
	// Section: Compiling Your Java Application
//	@Bean
//	public TomcatServletWebServerFactory servletContainer() {
//		TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
//		Connector ajpConnector = new Connector("AJP/1.3");
//		ajpConnector.setPort(9090);
//		ajpConnector.setSecure(false);
//		ajpConnector.setAllowTrace(false);
//		ajpConnector.setScheme("http");
//		((AbstractAjpProtocol<?>)ajpConnector.getProtocolHandler()).setSecretRequired(false);
//		tomcat.addAdditionalTomcatConnectors(ajpConnector);
//		return tomcat;
//	}
}
