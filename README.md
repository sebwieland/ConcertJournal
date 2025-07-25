# Concert Journal Monorepo

This repository contains both the frontend and backend components of the Concert Journal application, a web app to track where you've seen which bands.

## Project Structure

```
.
├── backend/           # Spring Boot backend API
│   ├── src/           # Java source code
│   ├── DB/            # Database files
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

## Getting Started

### Using Docker Compose (Recommended)

The easiest way to run the entire application stack is using Docker Compose:

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

#### Hot Reload Development Workflow

The Docker Compose setup is configured for a seamless development experience with hot reloading for both frontend and backend:

**Frontend Hot Reload:**
- The frontend uses Vite's Hot Module Replacement (HMR)
- Any changes to React components, CSS, or other frontend files will be automatically reflected in the browser
- No manual refresh needed - changes appear almost instantly

**Backend Hot Reload:**
- The backend uses Spring Boot DevTools for automatic restarts
- When you modify Java files, the application will automatically rebuild and restart
- Configuration changes are also detected and applied

**How to Use:**
1. Start the services with `docker-compose up`
2. Make changes to any frontend or backend file
3. Save the file
4. See your changes automatically applied

**Example Workflow:**
```bash
# Start the development environment
docker-compose up

# In another terminal, make changes to files
# For example, edit a React component or Java controller

# Changes are automatically detected and applied
# No need to rebuild or restart containers manually
```

### Local Development

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend API will be available at http://localhost:8080.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will be available at http://localhost:3000.

## Development Workflow

1. Clone the repository
2. Start the services using Docker Compose or run them individually
3. Make changes to the code
4. Test your changes locally
5. Commit and push your changes
## Test Data Management

The Concert Journal application generates test data automatically when starting up, ensuring a consistent development experience across all environments.

### Test Data Generation

Test data is created by the `DataLoader` component in `backend/src/main/java/com/ConcertJournalAPI/DataLoader.java`:

- 10 test concert events are created if no events exist in the database
- Works with both H2 (local development) and MySQL (Docker) databases
- Data is generated on every application startup when the database is empty
- This approach ensures test data is available regardless of environment or restarts

### Usage

**For Local Development:**
```bash
cd backend
./mvnw spring-boot:run
```
Test data will be automatically generated if no events exist.

**For Docker Development:**
```bash
docker-compose up
```
Test data will be automatically generated if no events exist.

### Customizing Test Data

To modify the test data, update the `createDummyBandEvent` method in `DataLoader.java`. The same test data generation logic is used for both H2 and MySQL databases.

To reset test data, remove the database volume:
```bash
# For Docker environment
docker-compose down -v
docker-compose up
```

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

The workflow is defined in `.github/workflows/ci.yml` and maintains the independent build processes from the previous separate repositories while consolidating them into a single configuration.

## License

[Add license information here]