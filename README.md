# Concert Journal

This repository contains both the frontend and backend components of the Concert Journal application, a web app to track where you've seen which bands.

## Project Structure

```
.
├── backend/           # Spring Boot backend API
│   ├── src/           # Java source code
│   └── ...
├── frontend/          # React frontend application
│   ├── src/           # TypeScript/JavaScript source code
│   └── ...
└── docker-compose.yml # Local development configuration
```

## Prerequisites

- Docker and Docker Compose
- Java 21 (for local backend development)
- Node.js 20 (for local frontend development)

## Development Approaches

This project supports two development approaches:

1. **Hybrid Approach (Strongly Recommended)**: MySQL in Docker, backend and frontend on the host
2. **Full Docker Approach**: Dev backend + MySQL in Docker, or the unified production container

The hybrid approach is strongly recommended for frontend development as it provides a significantly better developer experience with faster hot reloading and immediate feedback.

### Why Hybrid Development?

Running the app on the host while keeping the database in Docker provides several advantages:

- **Much faster hot reloading** - Changes are detected instantly via native file system events
- **Better developer experience** - Immediate feedback loop improves productivity
- **Simpler frontend setup** - Fewer configuration files and environment variables to manage
- **Consistent database** - MySQL still runs in Docker, sharing the volume with the other modes

## Getting Started

### Hybrid Approach (Recommended)

We've provided a helper script (`local-dev.sh`) in the root of the repository that sets up everything for you:

```bash
# Make the script executable (if needed)
chmod +x local-dev.sh

# Run the script
./local-dev.sh
```

This script will:
1. Start MySQL in Docker (and stop a Docker dev backend if one is running)
2. Start the backend on the host with the `dev` profile (exports a local `JWT_SECRET` if you have none set)
3. Start the Vite dev server on http://localhost:3000, which proxies `/api` to the backend on `:8080`

This is the recommended way to start development on this project.

#### Manual Setup for Hybrid Approach

If you prefer to set up manually:

1. **Start the backend services in Docker:**
   ```bash
   # Start only the backend and database
   docker-compose up backend mysql
   ```

2. **Install frontend dependencies locally:**
   ```bash
   cd frontend
   npm install
   ```

3. **Run the frontend locally:**
   ```bash
   # From the frontend directory
   npm run start:local
   ```

### Full Docker Approach

Services are grouped into compose profiles — a plain `docker-compose up` only starts MySQL.

```bash
# Dev backend + MySQL (frontend runs on the host, see above)
docker-compose --profile dev up -d

# Unified production container: SPA + API on one origin
docker-compose --profile production up --build

# Stop all services (add -v to also delete the database volume)
docker-compose down
```

In the production profile everything is served from http://localhost:8080 (SPA and `/api`).

## Backend Architecture

The full architecture documentation (arc42) lives in [`docs/architecture/`](docs/architecture/ARCHITECTURE.md).

The backend is a RESTful API built with:

- **Spring Boot**: Framework for building Java applications
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database access
- **H2 Database**: Default embedded database (configurable to use MySQL in development)
- **JWT**: JSON Web Tokens for stateless authentication

### API Endpoints

All data endpoints require a valid access token and are scoped to the signed-in user:

- `GET /api/allEvents`: all of the user's concert entries
- `GET|PUT|DELETE /api/event/{id}`, `POST /api/event`: single-entry CRUD (unknown ids return 404)
- `GET /api/me`: the current user
- `GET /api/me/export`, `PUT /api/me/password`, `DELETE /api/me`: account self-service (data export, password change, account deletion)
- `POST /api/refresh-token`, `GET /api/get-xsrf-cookie`: token refresh and CSRF bootstrap (anonymous)
- `POST /login`, `POST /register`, `POST /logout`: authentication, at the root path (no `/api` prefix)

For detailed API documentation, access the Swagger UI when the application is running:

```
http://localhost:8080/swagger-ui.html
```

### Backend Configuration

The application uses different property files for different environments:

- `application.properties`: Default configuration (in-memory H2 database, used by tests)
- `application-dev.properties`: Development configuration (MySQL database)
- `application-production.properties`: Production configuration (MySQL, secure cookies)

The backend refuses to start without a `JWT_SECRET` environment variable of at least 32 characters.

To use the development configuration when running locally:

```bash
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

## Frontend Configuration

Key configuration files:

- **vite.config.ts**: Contains the HMR configuration
- **docker-compose.yml**: Configures the Docker environment
- **.env.dev-local**: Sets environment variables for local development
- **package.json**: Contains npm scripts for development

Available scripts:

- `npm run start:local`: Start the development server locally (outside Docker)
- `npm run start:dev`: Start the development server with HMR in Docker
- `npm run start:prod`: Serve the production build
- `npm run build`: Build for production
- `npm run test`: Run tests

## Test Data Management

The Concert Journal application generates test data automatically when starting up, ensuring a consistent development experience across all environments.

### Test Data Generation

Test data is created by the `DataLoader` component in `backend/src/main/java/com/ConcertJournalAPI/DataLoader.java`:

- 10 test concert events are created if no events exist in the database
- Works with both H2 (local development) and MySQL (Docker) databases
- Data is generated on every application startup when the database is empty

### Customizing Test Data

To modify the test data, update the `createDummyBandEvent` method in `DataLoader.java`.

To reset test data, remove the database volume:
```bash
# For Docker environment
docker-compose down -v
docker-compose up
```

## Troubleshooting

### Frontend Issues

- **CORS errors**: There is deliberately no CORS configuration. In development the Vite dev server proxies `/api` to `:8080`, in production SPA and API share one origin. A CORS error means a request bypassed the proxy (e.g. a hardcoded `http://localhost:8080` URL)
- **Cannot connect to backend**: Check that the backend container is running and accessible
- **Hot reloading not working**: 
  - In hybrid mode: Ensure you're using the `start:local` script which disables polling
  - In Docker mode: Check browser console for WebSocket connection errors and verify Docker container logs

### Backend Issues

- **Database connection issues**: Verify MySQL container is running if using the dev profile
- **API not accessible**: Check that the backend is running on port 8080
- **Authentication problems**: Ensure JWT configuration is correct in application properties

## Building for Production

### Backend

```bash
cd backend
./mvnw clean package
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

## Continuous Integration

The monorepo uses GitHub Actions for CI/CD with path-based triggers to optimize build times:

- **Backend CI**: Triggered only when files in `backend/**` are modified
- **Frontend CI**: Triggered only when files in `frontend/**` are modified
- **Shared features**:
  - Automatic version tagging on main branch
  - Docker image building and publishing
  - Code testing and quality checks
  - Cross-platform Docker image support (amd64, arm64)

## License

[Add license information here]