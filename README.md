# Concert Journal

A web app to track where you've seen which bands.

## Prerequisites

- Docker and Docker Compose
- Node.js 22 (for local frontend development)

## Getting Started

```bash
./local-dev.sh
```

This starts MySQL + backend in Docker, then runs the frontend locally with fast hot reload.

**Manual setup:**

```bash
# Terminal 1: Start backend + database
docker-compose --profile dev up -d mysql backend

# Terminal 2: Start frontend
cd frontend
npm install
npm run start:local
```

- Frontend: http://localhost:3000 (proxies `/api` to backend)
- Backend API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## Production

Single container serving both frontend and backend:

```bash
docker-compose --profile production up --build
# Access http://localhost:8080
```

## Project Structure

```
.
├── Dockerfile              # Multi-stage build (frontend + backend)
├── docker-compose.yml      # Dev (profile: dev) and prod (profile: production)
├── local-dev.sh            # Helper script for development
├── backend/                # Spring Boot API (Java 21)
│   └── src/main/
│       ├── java/           # Controllers, services, models
│       └── resources/
│           └── db/migration/  # Flyway migrations
└── frontend/               # React + TypeScript + Vite
    └── src/
        ├── api/            # API clients (baseURL: /api)
        ├── components/     # React components
        ├── contexts/       # Auth context
        └── tests/          # Vitest tests
```

## Commands

**Frontend** (from `frontend/`):

| Command | Description |
|---------|-------------|
| `npm run start:local` | Dev server with Vite proxy |
| `npm run lint` | ESLint check |
| `npm test` | Vitest (watch mode) |
| `npm test -- --run` | Tests (run once) |
| `npm run build` | Production build |

**Backend** (from `backend/`):

| Command | Description |
|---------|-------------|
| `./mvnw spring-boot:run -Dspring.profiles.active=dev` | Run with MySQL |
| `./mvnw test` | Tests + JaCoCo coverage |
| `./mvnw clean package -Dmaven.test.skip=true` | Build JAR |

**Docker:**

| Command | Description |
|---------|-------------|
| `docker-compose --profile dev up -d` | Start dev backend + MySQL |
| `docker-compose --profile production up --build` | Test production locally |
| `docker-compose down` | Stop all services |
| `docker-compose down -v` | Stop and reset database |

## API Endpoints

All API endpoints use the `/api` prefix:

| Endpoint | Description |
|----------|-------------|
| `/api/allEvents` | List all events |
| `/api/event/{id}` | Get/update/delete event |
| `/api/me` | Current user info |
| `/api/refresh-token` | Refresh JWT |
| `/api/get-xsrf-cookie` | Get CSRF token |

Auth endpoints (Spring Security, no `/api` prefix): `/login`, `/register`, `/logout`

## Database

- **Dev:** MySQL in Docker, `mysql-data` volume persists across restarts
- **Migrations:** Flyway, auto-run on startup (`backend/src/main/resources/db/migration/`)
- **Test data:** Auto-generated if DB empty (`DataLoader.java`)
- **Reset:** `docker-compose down -v` then restart

## Architecture

- **No CORS** — Vite proxy in dev, same-origin in prod
- **Frontend** uses MUI, react-query, react-router-dom
- **Backend** uses Spring Boot 3.4, Spring Security, JPA, Lombok, Flyway
- **Auth:** JWT + CSRF tokens via cookies

## CI/CD

GitHub Actions with path-based triggers:

- **Backend CI:** Triggered on `backend/**` changes → test → build
- **Frontend CI:** Triggered on `frontend/**` changes → lint → test → build
- Auto version tagging on main branch
