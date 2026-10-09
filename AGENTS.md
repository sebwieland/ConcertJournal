# AGENTS.md

Monorepo: React/TypeScript frontend + Spring Boot backend.

## Git Workflow (hard rules for agents)

- **NEVER push to a remote without explicit instruction from the user.**
- **NEVER commit directly to `main`.** Work on feature branches; let the user decide what lands on main.
- Commit locally only: small, conventional commits on the current feature branch.
- If work accidentally lands on `main`: move it to the feature branch, reset `main` to its previous state. The user may rebase/squash-merge to main themselves, so feature branches often contain commits that exist on `main` under different SHAs — **rebase onto origin/main before merging back** (git drops patch-identical duplicates automatically).
- `AGENTS.md` and `docs/architecture/` are maintained by agents; keep them current.

## Development

**Hybrid mode (recommended):** MySQL in Docker, backend + Vite on host via one script:
```bash
./local-dev.sh
```
Or manually: backend `./mvnw spring-boot:run -Dspring.profiles.active=dev` (needs `JWT_SECRET` env, ≥32 chars), frontend `npx vite --port 3000 --mode dev-local` from `frontend/`.

Access: Frontend http://localhost:3000 (proxies `/api` → `:8080`), Backend http://localhost:8080, Swagger http://localhost:8080/swagger-ui.html

**No CORS needed:** Vite proxy in dev, same-origin in prod.

## Commands

**Frontend** (from `frontend/`):
- `npm run start:local` - Dev server with Vite proxy
- `npm run lint` - ESLint check
- `npm test` - Vitest (watch mode); `npm test -- --run` for one shot
- `npm run build` - Production build (tsc + vite, `noEmit` on)
- `npm run test:e2e` - Playwright browser journey (BASE_URL=http://localhost:3000 by default; `BASE_URL=http://localhost:8080` against the unified container)

**Backend** (from `backend/`):
- `./mvnw spring-boot:run -Dspring.profiles.active=dev` - Run with MySQL
- `./mvnw test` - Tests + JaCoCo coverage
- `./mvnw clean package -Dmaven.test.skip=true` - Build JAR

**Docker:**
- `docker-compose --profile dev up -d` - Dev backend + MySQL
- `docker-compose --profile production up --build` - Unified app container (SPA + API, Port 8080)
- `docker-compose down` / `down -v` - Stop / stop + delete DB

## Architecture

**Frontend:**
- Entry: `src/index.tsx` → `src/App.tsx` (class shell, lazy routes: `/`, `/new-entry`, `/your-journal`, `/statistics`, `/artist/:name`, `/venue/:name`, `/edit-entry/:id`, `/sign-in`, `/sign-up`)
- API clients: `src/api/` — `apiClient` (baseURL `/api`), `rootClient` (auth endpoints at root)
- Auth: `src/contexts/AuthContext.tsx`; theme: `src/theme/` (InterVariable font bundled via @fontsource, indigo/amber palette)
- Test utils: `src/tests/utils/test-utils.tsx` (use `renderWithProviders`); note `vitest.setup.ts` globally mocks `apiClient`, `apiErrors`, `musicBrainzApi`, `DefaultLayout` and `RatingStars`
- Pure utilities: `src/utils/parseEventDate.ts` (canonical date parsing) and `src/utils/statistics.ts` (derive stats from events)

**Backend:**
- Entry: `src/main/java/com/ConcertJournalAPI/ConcertJournalAPI.java` — **no `@EnableWebMvc`** (it disables Boot auto-config and silently drops all `spring.jackson.*` settings)
- Controllers: all under `@RequestMapping("/api")` — BandEventController (`/api/allEvents`, `/api/event/{id}`), HomeController (`/api/me`), SecurityController (`/api/refresh-token`, `/api/get-xsrf-cookie`)
- Auth endpoints at **root** (no /api prefix): `/login`, `/register`, `/logout` (Spring Security convention)
- Security chain (`SecurityConfiguration`): `/api/**` → authenticated, `denyAll` fallback, JSON 401 entrypoint for APIs. **Must stay anonymously permitted:** `/api/refresh-token`, `/api/get-xsrf-cookie`, `/register`, `/login`, `/logout`, actuator health, and the SPA document-route matcher
- SPA serving: `SpaController` forwards `/` plus all 1- and 2-segment dot-free document routes to `index.html`; adding a deeper route (e.g. `/a/:param`) requires updating **both** the `SpaController` mapping and the SecurityConfiguration matcher, plus the `RateLimitFilter` needs no change (300 req/min per IP, clean 429)
- Migrations: `src/main/resources/db/migration/` (Flyway, MySQL-compatible DDL); prod DBs use `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` if pre-existing
- Static files: `/app/static/` in the unified container (`WebConfig` + `SpaController`)

**Auth model (do not break):**
- 3-min access JWT (`typ=access`) in React state only; 30-day refresh JWT (`typ=refresh`) in HttpOnly cookie; CSRF double-submit (`XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header interceptor in `apiClient.tsx`)
- Cookie scope/secure config via env: `AUTH_COOKIE_DOMAIN`, `AUTH_COOKIE_SECURE` (empty/false for plain-HTTP localhost runs; set domain + secure=true for real HTTPS deployments)
- `JWT_SECRET` must be ≥32 chars; known default strings hard-fail at startup

## Gotchas (purchased with debugging sessions — re-read before assuming)

- `@mui/x-data-grid` **v7**: `valueFormatter` receives the raw value first `(value, row, column, apiRef)`, not a params object
- MUI X Charts: use plain vertical `BarChart`/`LineChart` with `xAxis: [{scaleType: "band", data}]`; the `layout` prop gets overwritten by `useBarChartProps` and crashes as y-axis scale errors in 7.29
- `DefaultLayout` renders children inside a `md:flex-row` Stack — multi-block pages (statistics, deep dives) must wrap ALL content in **one** container `Box` or blocks split into side-by-side columns
- Never run plain `tsc` with emit; `tsconfig.json` has `noEmit` and `src/**/*.js(.map)` artifacts are gitignored — stale `.js` files used to shadow `.tsx` sources in Vite dev
- `npm run build` = `tsc && vite build` — unit tests don't type-check, CI does; run `npx tsc --noEmit` after test-only changes
- The e2e journey (`e2e/e2e.cjs`) self-diagnoses: on failure it dumps browser console + ≥400 network responses; `frontend/e2e/e2e-out/` is gitignored
- Dates on the wire are ISO strings (`spring.jackson.serialization.write-dates-as-timestamps=false`); `parseEventDate` still tolerates legacy array shapes from old caches

## CI & SEO

- `global-ci.yml` orchestrates: change detection → backend-ci → frontend-ci (lint+audit gate+test+build) → `e2e-smoke` (builds the unified image, **Trivy HIGH/CRITICAL image gate runs before the stack boots** — this is also the authoritative scan of the full transitive backend dep graph, since `trivy fs` only sees pom direct deps → boots compose, runs the browser journey, dumps app logs on failure) → `publish-artifacts` (multi-arch `v{N}`/`git-{sha7}`/`latest` to the registry on main only; build stages pinned to `$BUILDPLATFORM` — arm64 is built natively, Node-under-QEMU crashes otherwise)
- `security.yml`: Trivy repo scan (vulns without dev-deps, secrets, docker misconfig; HIGH/CRITICAL, exit 1) on every push/PR touching code, plus a Monday-morning cron that re-scans the released `latest` image from the registry so CVEs disclosed after a release surface. Suppressions go in `.trivyignore` — one line per finding, rationale + date required, delete when the fix lands. Trivy DB is cached with the shared key `trivy-db-<os>` across all jobs
- Dependabot (`.github/dependabot.yml`): Monday ~08:00 Berlin, weekly version PRs — npm grouped (`@mui/* /* lockstep */`, other prod, dev), Maven grouped (Spring Boot parent excluded, takes its own PR), Dockerfile, GitHub Actions (grouped). Security-update PRs arrive independently of the schedule; `npm audit --omit=dev` in frontend-ci remains the on-CI gate
- Public SEO surface: `frontend/index.html` (meta/OG/JSON-LD), `public/robots.txt` (Disallow for API and all private routes), sitemap generated by `vite-plugin-sitemap` with `generateRobotsTxt: false` and only public routes in `dynamicRoutes` — the plugin's default would emit "allow /" robots and list private pages!

## Conventions

- Test data auto-generated on startup if DB empty (`DataLoader.java`: admin@example.com / password + 10 demo events)
- Backend uses Lombok; frontend uses MUI + react-query (still v3 API)
- CI order: lint → test → build (frontend); test → build (backend)
- **No CORS config** - Vite proxy in dev, same-origin in prod

## Production Testing

```bash
docker-compose down  # Stop dev services
docker-compose --profile production up -d --build
# Access http://localhost:8080 (SPA + API unified, same origin)
docker compose logs app | grep -E "ERROR"   # server-side diagnosis
```

**Database:**
- `mysql-data` volume shared across modes; connection `jdbc:mysql://mysql:3306/concertjournal`, user/password
- Flyway runs automatically at startup; `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` (+`BASELINE_VERSION=2`) for the legacy prod schema (`users`/`band_events`, created pre-Flyway)
- Test data: auto-generated if DB empty (`DataLoader.java`)
