package info.itzjacky.FYP;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.apache.coyote.ajp.AbstractAjpProtocol;

import java.util.Map;

@SpringBootApplication
public class FypApplication {

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
