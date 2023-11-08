FROM openjdk:17-jdk-slim
ADD target/critiQ-backend.jar critiQ-backend.jar
ENTRYPOINT ["java","-jar","/critiQ-backend.jar","--server.port=8080"]