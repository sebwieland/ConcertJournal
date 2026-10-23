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
- Entry: `src/index.tsx` → `src/App.tsx` (class shell, lazy routes: `/`, `/new-entry`, `/your-journal`, `/statistics`, `/artist/:name`, `/venue/:name`, `/edit-entry/:id`, `/settings`, `/privacy` (public), `/sign-in`, `/sign-up`)
- API clients: `src/api/` — `apiClient` (baseURL `/api`), `rootClient` (auth endpoints at root)
- Auth: `src/contexts/AuthContext.tsx`; theme: `src/theme/` (InterVariable font bundled via @fontsource, indigo/amber palette)
- Test utils: `src/tests/utils/test-utils.tsx` (use `renderWithProviders`); note `vitest.setup.ts` globally mocks `apiClient`, `apiErrors`, `musicBrainzApi`, `DefaultLayout` and `RatingStars`
- Pure utilities: `src/utils/parseEventDate.ts` (canonical date parsing) and `src/utils/statistics.ts` (derive stats from events)

**Backend:**
- Entry: `src/main/java/com/ConcertJournalAPI/ConcertJournalAPI.java` — **no `@EnableWebMvc`** (it disables Boot auto-config and silently drops all `spring.jackson.*` settings)
- Errors: `ApiExceptionHandler` maps `EventNotFoundException` → 404 and `AuthenticationCredentialsNotFoundException` → 401 with `{status,error,message}`; `@Valid` failures and `InvalidFieldException` → 422 with an extra `errors: {field: message}` map (the frontend shows `message` and per-field `details`); throw those (or add a mapping), never bare `RuntimeException`. Resolve the owner via `CurrentUserProvider`, not by hand
- Controllers: all under `@RequestMapping("/api")` — BandEventController (`/api/allEvents`, `/api/event/{id}`), HomeController (`/api/me`), AccountController (`/api/me/export`, `PUT /api/me/password`, `DELETE /api/me` — password-confirmed, expires the refresh cookie), SecurityController (`/api/refresh-token`, `/api/get-xsrf-cookie`)
- Auth endpoints at **root** (no /api prefix): `/login`, `/register`, `/logout` (Spring Security convention)
- Security chain (`SecurityConfiguration`): `/api/**` → authenticated, `denyAll` fallback, JSON 401 entrypoint for APIs. **Must stay anonymously permitted:** `/api/refresh-token`, `/api/get-xsrf-cookie`, `/register`, `/login`, `/logout`, actuator health, and the SPA document-route matcher
- SPA serving: `SpaController` forwards `/` plus all 1- and 2-segment dot-free document routes to `index.html`; adding a deeper route (e.g. `/a/:param`) requires updating **both** the `SpaController` mapping and the SecurityConfiguration matcher, plus the `RateLimitFilter` needs no change (300 req/min keyed on `remoteAddr` only — never on `X-Forwarded-For`; proxies are honoured via `server.forward-headers-strategy=native` from internal addresses; clean 429)
- Migrations: `src/main/resources/db/migration/` (Flyway, MySQL-compatible DDL); prod DBs use `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` if pre-existing
- Static files: `/app/static/` in the unified container (`WebConfig` + `SpaController`)

**Auth model (do not break):**
- 3-min access JWT (`typ=access`) in React state only; 30-day refresh JWT (`typ=refresh`) in HttpOnly cookie; CSRF double-submit (`XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header interceptor in `apiClient.tsx`)
- Cookie scope/secure config via env: `AUTH_COOKIE_DOMAIN`, `AUTH_COOKIE_SECURE` (empty/false for plain-HTTP localhost runs; set domain + secure=true for real HTTPS deployments)
- `JWT_SECRET` must be ≥32 chars; known default strings hard-fail at startup

## Gotchas (purchased with debugging sessions — re-read before assuming)

- `@mui/x-data-grid` (since v7, now on v9): `valueFormatter` receives the raw value first `(value, row, column, apiRef)`, not a params object
- MUI X Charts: use plain vertical `BarChart`/`LineChart` with `xAxis: [{scaleType: "band", data}]`; the `layout` prop gets overwritten by `useBarChartProps` and crashed as y-axis scale errors in 7.29 — re-verify before relying on `layout` in v9
- `DefaultLayout` renders children inside a `md:flex-row` Stack — multi-block pages (statistics, deep dives) must wrap ALL content in **one** container `Box` or blocks split into side-by-side columns
- Never run plain `tsc` with emit; `tsconfig.json` has `noEmit` and `src/**/*.js(.map)` artifacts are gitignored — stale `.js` files used to shadow `.tsx` sources in Vite dev
- `npm run build` = `tsc && vite build` — unit tests don't type-check, CI does; run `npx tsc --noEmit` after test-only changes
- The e2e journey (`e2e/e2e.cjs`) self-diagnoses: on failure it dumps browser console + ≥400 network responses; `frontend/e2e/e2e-out/` is gitignored
- Dates on the wire are ISO strings (`spring.jackson.datatype.datetime.write-dates-as-timestamps=false` — Jackson 3 key; the old `spring.jackson.serialization.*` form now fails startup); `parseEventDate` still tolerates legacy array shapes from old caches

## CI & SEO

- `global-ci.yml` orchestrates: change detection → backend-ci → frontend-ci (lint+audit gate+test+build) → `e2e-smoke` (builds the unified image, **Trivy HIGH/CRITICAL image gate runs before the stack boots** — this is also the authoritative scan of the full transitive backend dep graph, since `trivy fs` only sees pom direct deps → boots compose, runs the browser journey, dumps app logs on failure) → `publish-artifacts` (multi-arch `v{N}`/`git-{sha7}`/`latest` to the registry on main only; build stages pinned to `$BUILDPLATFORM` — arm64 is built natively, Node-under-QEMU crashes otherwise)
- `security.yml`: Trivy repo scan (vulns without dev-deps, secrets, docker misconfig; HIGH/CRITICAL, exit 1) on every push/PR touching code, plus a Monday-morning cron that re-scans the released `latest` image from the registry so CVEs disclosed after a release surface. Suppressions go in `.trivyignore` — one line per finding, rationale + date required, delete when the fix lands. Trivy DB is cached with the shared key `trivy-db-<os>` across all jobs
- Dependabot (`.github/dependabot.yml`): Monday ~08:00 Berlin, weekly version PRs — npm grouped (`@mui/* /* lockstep */`, other prod, dev), Maven grouped (Spring Boot parent excluded, takes its own PR), Dockerfile, GitHub Actions (grouped). Security-update PRs arrive independently of the schedule; `npm audit --omit=dev` in frontend-ci remains the on-CI gate
- Public SEO surface: `frontend/index.html` (meta/OG/JSON-LD), `public/robots.txt` (Disallow for API and all private routes), sitemap generated by `vite-plugin-sitemap` with `generateRobotsTxt: false` and only public routes in `dynamicRoutes` (currently `/privacy`) — the plugin's default would emit "allow /" robots and list private pages!

## Conventions

- Dependabot grouping lessons (purchased 2026-10-09): groups' `update-type:` filter does **not** keep majors out (verified in updater logs — react 19 rode a "prod-minors" PR). The working mechanism is flat `ignore:` version blocks in `dependabot.yml`; every held major is listed there with a one-line comment citing the session that owes the migration (web-vitals 3+, vite 8 family, vitest 5, eslint 10+ts-es 8, TypeScript 7 (Go compiler!), mysql-connector-j 26.x). When a migration lands, delete its ignore line in the same PR. `@dependabot recreate` re-cuts a PR; queue-lag means recreate jobs can replay the pre-config resolution — never stack multiple recreate comments, one at a time, and re-read the PR's package table before re-running CI

- Test data auto-generated on startup if DB empty (`DataLoader.java`: admin@example.com / password + 10 demo events) — **never in production** (`@Profile("!production")`); it used to create that publicly known login on the live site
- **Privacy policy is code-coupled:** `frontend/src/components/legal/privacyContent.ts` describes every data flow (cookies, local storage, logging, third-party calls such as MusicBrainz, stored fields). Any change to those — a new cookie, a new external request, logging personal data, analytics — must update BOTH languages and the "Stand/Last updated" date in the same PR. Do not log personal data (emails, IPs); the policy promises none is logged
- No Impressum by owner decision (2026-10-23): free, ad-free hobby project, treated as not "geschäftsmäßig" under § 5 DDG. If the site ever earns money (ads, donations, paid features), an Impressum becomes mandatory — raise it with the owner
- **Spring Boot 4.1** (Framework 7, Security 7, Jackson 3, Hibernate 7, Tomcat 11) — lessons from the 2026-10-23 migration:
  - Auto-configuration is split per module: Flyway needs `spring-boot-starter-flyway` (with only `flyway-core`, migrations **silently never run**); `@WebMvcTest`/`@AutoConfigureMockMvc` need `spring-boot-starter-webmvc-test` and live in `org.springframework.boot.webmvc.test.autoconfigure`
  - `@MockBean` is gone → `@MockitoBean` (`org.springframework.test.context.bean.override.mockito`)
  - Security 7 string matchers are strict path patterns: they must start with `/` (`"/*.ico"`, not `"*.ico"`) or the filter chain fails to build
  - App code uses Jackson 3 (`tools.jackson.*`); annotations stay `com.fasterxml.jackson.annotation`. Jackson 2 remains on the classpath only for jjwt
  - `AuthFlowIntegrationTest` drives login → API → refresh through the full context without a socket — run it first after framework bumps
- Backend uses Lombok; frontend uses MUI + @tanstack/react-query v5 (object syntax: `useQuery({queryKey, queryFn})`; `mutationFn` receives `(variables, context)`, so wrap API calls instead of passing them directly)
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
