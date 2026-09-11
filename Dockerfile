FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B -T 1C \
    -Dmaven.artifact.threads=10 \
    --no-transfer-progress && \
    chown -R 1001:1001 /root/.m2
COPY backend/src ./src
RUN mvn package -DskipTests -T 1C \
    --no-transfer-progress \
    -Dmaven.test.skip=true \
    -Dmaven.javadoc.skip=true \
    -Dmaven.source.skip=true && \
    test -f target/ConcertJournalAPI-0.0.1-SNAPSHOT.jar

FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -S -u 1001 -G appgroup appuser && \
    apk add --no-cache curl

COPY --from=backend-build --chown=appuser:appgroup /app/target/ConcertJournalAPI-0.0.1-SNAPSHOT.jar /app/app.jar

COPY --from=frontend-build --chown=appuser:appgroup /frontend/dist /app/static

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "/app/app.jar"]
