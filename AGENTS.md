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
cd backend && 'JWT_SECRET=dev-secret-change-in-production!' ./mvnw spring-boot:run -Dspring.profiles.active=dev
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
- `JWT_SECRET=dev-secret-change-in-production! ./mvnw spring-boot:run -Dspring.profiles.active=dev` - Run with MySQL
- `./mvnw test` - Tests + JaCoCo coverage
- `./mvnw clean package -Dmaven.test.skip=true` - Build JAR

**Docker (dev):**
- `docker-compose up -d mysql` - Start MySQL only (for native backend)
- `docker-compose --profile dev up -d` - Start dev backend + MySQL
- `docker-compose down` - Stop all services
- `docker-compose down -v` - Stop and delete database (reset)

**Docker (production):**
- `docker compose -f docker-compose.prod.yml up -d` - Start production
- `docker compose -f docker-compose.prod.yml down` - Stop production
- Requires `.env` file with `JWT_SECRET`, `DATABASE_PASSWORD`, `DATABASE_ROOT_PASSWORD`

## Architecture

**Frontend:**
- Entry: `src/index.tsx` → `src/App.tsx`
- API clients: `src/api/` (plain modules, not hooks)
- Auth: `src/contexts/AuthContext.tsx` + `src/api/apiClient.tsx` (401 interceptor with retry)
- Date handling: `src/utils/dateUtils.ts` (`parseEventDate`, `formatEventDate`)
- Test utils: `src/tests/utils/test-utils.tsx` (use `renderWithProviders`)
- Vite proxy: `/api` → `http://127.0.0.1:8080/api` (dev only)

**Backend:**
- Entry: `src/main/java/com/ConcertJournalAPI/ConcertJournalAPI.java`
- Controllers: All REST controllers use `@RequestMapping("/api")`
  - BandEventController: `/api/allEvents`, `/api/event/{id}`
  - HomeController: `/api/me`
  - UserController: `/api/register`, `/api/me/password`, `DELETE /api/me`
  - SecurityController: `/api/refresh-token`, `/api/get-xsrf-cookie`
- Auth endpoints: `/api/login`, `/api/register`, `/api/logout` (Spring Security, under /api)
- Exceptions: `exception/` package with `GlobalExceptionHandler` (@RestControllerAdvice)
- Refresh tokens: `RefreshToken` entity with SHA-256 hashed server-side storage, family-based rotation
- Migrations: `src/main/resources/db/migration/` (Flyway, `V{N}__{description}.sql`, MySQL syntax)
- Static files: Served from `/app/static/` in prod (`SpaController.java`)

## Conventions

- Test data auto-generated on startup in dev profile (`DataLoader.java`)
- Backend uses Lombok; frontend uses MUI + react-query
- CI uses path-based triggers (`backend/**`, `frontend/**`)
- CI order: lint → test → build (frontend); test (backend); unified image build on main
- CI publishes a single unified Docker image (`concertjournal:latest`) to the Synology registry
- **No CORS config** - Vite proxy in dev, same-origin in prod
- **Stateless sessions** - JWT-based auth, no JSESSIONID
- **JWT_SECRET** must be at least 32 characters

## Production

**Deployment:**
```bash
# On the server, create .env:
JWT_SECRET=<random 32+ char secret>
DATABASE_PASSWORD=<strong password>
DATABASE_ROOT_PASSWORD=<strong root password>

# Start:
docker compose -f docker-compose.prod.yml up -d
# Access: http://localhost:8080
```

**Docker Compose files:**
- `docker-compose.yml` - Development only (MySQL + optional backend container)
- `docker-compose.prod.yml` - Production (pulls pre-built image from registry + MySQL)

**Database:**
- MySQL volume `mysql-data` persists across restarts
- Connection: `jdbc:mysql://mysql:3306/concertjournal`
- Dev credentials: `user` / `password` (defaults)
- Production credentials: Set via `.env` (required, no defaults)
- Migrations: Auto-run via Flyway on startup
- Test data: Auto-generated in dev profile only (`DataLoader.java`)
