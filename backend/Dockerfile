# Build stage with optimized Maven image
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Create non-root user for better security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -u 1001 -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Copy only pom.xml first to leverage Docker cache for dependencies
COPY --chown=appuser:appgroup pom.xml .

# Download all required dependencies into one layer with parallel builds
# Use specific Maven options for optimization
RUN mvn dependency:go-offline -B -T 1C \
    -Dmaven.artifact.threads=10 \
    -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn \
    --no-transfer-progress && \
    # Set proper permissions
    chown -R appuser:appgroup /root/.m2

# Copy source code after dependency resolution
COPY --chown=appuser:appgroup src ./src

# Build with parallel execution and optimization flags
RUN mvn package -DskipTests -T 1C \
    --no-transfer-progress \
    -Dmaven.test.skip=true \
    -Dmaven.javadoc.skip=true \
    -Dmaven.source.skip=true && \
    # Verify the JAR exists
    test -f target/ConcertJournalAPI-0.0.1-SNAPSHOT.jar && \
    # Set proper permissions
    chown -R appuser:appgroup /app/target

# Development stage - for hot reloading
FROM maven:3.9-eclipse-temurin-21-alpine AS development
WORKDIR /app

# Create non-root user for better security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -u 1001 -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Copy only pom.xml first to leverage Docker cache for dependencies
COPY --chown=appuser:appgroup pom.xml .

# Install dependencies with parallel execution but don't build
RUN mvn dependency:go-offline -B -T 1C \
    -Dmaven.artifact.threads=10 \
    --no-transfer-progress && \
    # Set proper permissions
    chown -R appuser:appgroup /root/.m2

# We'll mount the src directory as a volume
VOLUME /app/src
VOLUME /app/target

# Switch to non-root user for development
USER appuser

# Expose ports
EXPOSE 8080
EXPOSE 35729

# Add health check for development
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# The command will be provided by docker-compose.yml

# Runtime stage - using smaller JRE image
FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app

# Create non-root user for better security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -u 1001 -G appgroup appuser && \
    chown -R appuser:appgroup /app && \
    # Add curl for health check
    apk add --no-cache curl

# Copy the entire JAR file from build stage
COPY --from=build --chown=appuser:appgroup /app/target/ConcertJournalAPI-0.0.1-SNAPSHOT.jar /app/app.jar

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Add JVM optimization flags
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "/app/app.jar"]
