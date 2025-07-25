# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy only pom.xml first to leverage Docker cache for dependencies
COPY pom.xml .

# Download all required dependencies into one layer with parallel builds
RUN mvn dependency:go-offline -B -T 1C

# Copy source code after dependency resolution
COPY src ./src

# Build with parallel execution
RUN mvn package -DskipTests -T 1C

# Development stage - for hot reloading
FROM maven:3.9-eclipse-temurin-21-alpine AS development
WORKDIR /app

# Copy only pom.xml first to leverage Docker cache for dependencies
COPY pom.xml .

# Install dependencies with parallel execution but don't build
RUN mvn dependency:go-offline -B -T 1C

# We'll mount the src directory as a volume
VOLUME /app/src
VOLUME /app/target
EXPOSE 8080
EXPOSE 35729
# The command will be provided by docker-compose.yml

# Runtime stage - using smaller JRE image instead of JDK
FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=build /app/target/ConcertJournalAPI-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080

# Add JVM optimization flags
CMD ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
