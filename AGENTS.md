# AGENTS.md

Monorepo: React/TypeScript frontend + Spring Boot backend.

## Development

**Hybrid mode (recommended):** Frontend runs locally with Vite proxy, backend in Docker.
```bash
./local-dev.sh
# OR manually:
docker-compose --profile dev up -d mysql backend
cd frontend && npm run start:local
```

**Native backend (faster, needs Java 21):**
```bash
./local-dev.sh native
# OR manually:
docker-compose up -d mysql
cd backend && JWT_SECRET=dev-secret ./mvnw spring-boot:run -Dspring.profiles.active=dev
# In another terminal:
cd frontend && npm run start:local
```

Access: Frontend http://localhost:3000 (proxies `/api` to backend), Backend http://localhost:8080, Swagger http://localhost:8080/swagger-ui.html

**No CORS needed:** Vite proxy in dev, same-origin in prod.

## Commands

**Frontend** (from `frontend/`):
- `npm run start:local` - Dev server with Vite proxy
- `npm run lint` - ESLint check
- `npm test` - Vitest (watch mode)
- `npm test -- --run` - Run once
- `npm run build` - Production build (tsc + vite)

**Backend** (from `backend/`):
- `JWT_SECRET=dev-secret ./mvnw spring-boot:run -Dspring.profiles.active=dev` - Run with MySQL
- `./mvnw test` - Tests + JaCoCo coverage
- `./mvnw clean package -Dmaven.test.skip=true` - Build JAR

**Docker:**
- `docker-compose up -d mysql` - Start MySQL only (for native backend)
- `docker-compose --profile dev up -d` - Start dev backend + MySQL
- `docker-compose --profile production up --build` - Test production locally
- `docker-compose down` - Stop all services
- `docker-compose down -v` - Stop and delete database (reset)

## Architecture

**Frontend:**
- Entry: `src/index.tsx` → `src/App.tsx`
- API clients: `src/api/` (all use `/api` baseURL)
- Auth: `src/contexts/AuthContext.tsx`
- Test utils: `src/tests/utils/test-utils.tsx` (use `renderWithProviders`)
- Vite proxy: `/api` → `http://localhost:8080/api` (dev only)

**Backend:**
- Entry: `src/main/java/com/ConcertJournalAPI/ConcertJournalAPI.java`
- Controllers: All REST controllers use `@RequestMapping("/api")`
  - BandEventController: `/api/allEvents`, `/api/event/{id}`
  - HomeController: `/api/me`
  - SecurityController: `/api/refresh-token`, `/api/get-xsrf-cookie`
- Auth endpoints: `/api/login`, `/api/register`, `/api/logout` (Spring Security, under /api)
- Migrations: `src/main/resources/db/migration/` (Flyway, `V{N}__{description}.sql`, MySQL syntax)
- Static files: Served from `/app/static/` in prod (`SpaController.java`)

## Conventions

- Test data auto-generated on startup if DB empty (`DataLoader.java`)
- Backend uses Lombok; frontend uses MUI + react-query
- CI uses path-based triggers (`backend/**`, `frontend/**`)
- CI order: lint → test → build (frontend); test → build (backend)
- **No CORS config** - Vite proxy in dev, same-origin in prod

## Production Testing

**Test production build locally:**
```bash
docker-compose down  # Stop dev services
docker-compose --profile production up --build
# Access http://localhost:8080 (frontend + backend unified)
# Stop: docker-compose down
# Back to dev: ./local-dev.sh
```

**Database:**
- Shared `mysql-data` volume across all modes
- Connection: `jdbc:mysql://mysql:3306/concertjournal`
- Credentials: `user` / `password` (override with `.env` file)
- Migrations: Auto-run via Flyway on startup
- Test data: Auto-generated if DB empty (`DataLoader.java`)
