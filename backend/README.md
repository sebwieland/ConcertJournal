# Concert Journal Backend API

This is the backend API for the Concert Journal application, built with Spring Boot.

## Architecture

The backend is a RESTful API built with:

- **Spring Boot**: Framework for building Java applications
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database access
- **H2 Database**: Default embedded database (configurable to use MySQL in development)
- **JWT**: JSON Web Tokens for stateless authentication

## Directory Structure

```
backend/
├── src/                    # Source code
│   ├── main/               # Main application code
│   │   ├── java/           # Java source files
│   │   └── resources/      # Configuration files
│   └── test/               # Test code
├── DB/                     # Database files
├── Dockerfile              # Docker configuration
├── pom.xml                 # Maven dependencies
└── README.md               # This file
```

## Running Locally

### Prerequisites

- Java 21 or higher
- Maven 3.6 or higher

### Using Maven

```bash
# From the backend directory
./mvnw spring-boot:run
```

### Using Docker

```bash
# From the root directory of the monorepo
docker-compose up backend
```

## Configuration

The application uses different property files for different environments:

- `application.properties`: Default configuration (H2 database)
- `application-dev.properties`: Development configuration (MySQL database)

To use the development configuration:

```bash
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

## API Endpoints

The API provides the following endpoints:

- `/api/events`: Band event operations
- `/api/users`: User operations
- `/api/auth`: Authentication operations

For detailed API documentation, access the Swagger UI when the application is running:

```
http://localhost:8080/swagger-ui.html
```

## Database

### Default Configuration (H2)

By default, the application uses an H2 embedded database stored in the `DB/` directory.

### Development Configuration (MySQL)

For development, the application can be configured to use MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/concertjournal
spring.datasource.username=user
spring.datasource.password=password
```

## Testing

Run the tests using Maven:

```bash
./mvnw test
```

Generate a test coverage report:

```bash
./mvnw verify
```

The coverage report will be available in `target/site/jacoco-aggregate/index.html`.

## Docker

The backend can be built and run as a Docker container:

```bash
# Build the Docker image
docker build -t concert-journal-backend .

# Run the container
docker run -p 8080:8080 concert-journal-backend
```

## Integration with Frontend

In the monorepo setup, the backend is configured to work seamlessly with the frontend. The CORS configuration allows requests from the frontend development server.

For local development using Docker Compose, the backend is accessible to the frontend at `http://backend:8080` within the Docker network, and at `http://localhost:8080` from the host machine.