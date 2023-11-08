FROM openjdk:17-jdk-slim
EXPOSE 8080
ADD target/critiQ-backend.jar critiQ-backend.jar
ENTRYPOINT ["java","-jar","/critiQ-backend.jar","--server.port=9000"]