# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download all required dependencies into one layer
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Development stage - for hot reloading
FROM maven:3.9-eclipse-temurin-21 AS development
WORKDIR /app
COPY pom.xml .
# Install dependencies but don't build
RUN mvn dependency:go-offline -B
# We'll mount the src directory as a volume
VOLUME /app/src
VOLUME /app/target
EXPOSE 8080
EXPOSE 35729
# The command will be provided by docker-compose.yml

# Runtime stage
FROM openjdk:21
VOLUME /tmp
WORKDIR /app
COPY --from=build /app/target/ConcertJournalAPI-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
