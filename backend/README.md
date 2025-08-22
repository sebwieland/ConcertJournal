# Concert Journal Backend API

This is the backend API for the Concert Journal application, built with Spring Boot.

## Documentation

For comprehensive documentation, including setup instructions, development approaches, and troubleshooting, please refer to the [main README](../README.md) in the root of the repository.

## Key Points

- **Architecture**: Spring Boot, Spring Security, Spring Data JPA, H2/MySQL, JWT
- **API Endpoints**:
  - `/api/events`: Band event operations
  - `/api/users`: User operations
  - `/api/auth`: Authentication operations
- **Configuration**:
  - `application.properties`: Default configuration (H2 database)
  - `application-dev.properties`: Development configuration (MySQL database)
- **Local Development**:
  ```bash
  ./mvnw spring-boot:run -Dspring.profiles.active=dev
  ```
- **Testing**:
  ```bash
  ./mvnw test