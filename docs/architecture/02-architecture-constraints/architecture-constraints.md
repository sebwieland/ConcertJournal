# 2. Architecture Constraints

<!-- https://docs.arc42.org/section-2/ -->

<!-- arc42 tip: Constraints are requirements that limit design freedom.
     They may come from the organisation, the law, technology mandates, or contractual obligations.
     Document every constraint explicitly — decisions made without knowing a constraint can be very costly to reverse.
     Note whether each constraint is truly non-negotiable or merely strongly preferred. -->

## Technical Constraints

<!-- tip: Include: required runtime environment, mandated languages or frameworks,
     integration obligations with existing systems, hardware limits, and security standards. -->

| Constraint | Background / Reason |
|---|---|
| Java 21 runtime; Spring Boot 3.4 with Spring Security, JPA/Hibernate | Existing codebase and ecosystem choice (`backend/pom.xml`) |
| Frontend must run on React 18 + TypeScript 5 with Vite 5 | Existing codebase (`frontend/package.json`) |
| Production database is MySQL 8; Flyway is the only schema-change mechanism | Self-hosted MySQL on Docker volume; `db/migration` is source of truth |
| H2 embedded DB must remain supported (default Spring profile) | Local development without Docker; *note: migration scripts use H2-flavoured SQL — see §11* |
| Production runs as a single Docker container (frontend + backend unified, `/app/static/`) | Self-hosted single-service deployment; `SpaController.java`, `Dockerfile` |
| Multi-arch images (amd64/arm64) required | Target host is an ARM-based Synology NAS (registry: `registry.wielandseb.synology.me`) |
| Public domain `concertjournal.de`; backend also reachable as `api.concertjournal.de` | Domain/infrastructure decision; drives cookie domain and SameSite handling |
| `JWT_SECRET` provided via environment variable — application refuses to start without it | `JwtUtils.java` static initializer |
| Spring Security convention: auth endpoints (`/login`, `/register`, `/logout`) live at the root without the `/api` prefix | `SecurityConfiguration.java` authorize rules |

## Organisational Constraints

<!-- tip: Team size, budget envelope, fixed delivery dates, external dependencies,
     methodology constraints (e.g. "must follow SAFe PI cadence"). -->

| Constraint | Background / Reason |
|---|---|
| Solo developer, hobby project, no budget | favors managed/self-hosted simplicity over enterprise tooling; documentation like this one lowers the bus factor |
| CI must be path-based and fast (only rebuild what changed) | GitHub Actions minutes; `change-detection.yml` with `dorny/paths-filter` |
| Test data auto-generated on startup when DB is empty | `DataLoader.java` — keeps every environment instantly usable |

## Conventions

<!-- tip: Coding standards, naming conventions, documentation formats, tool mandates,
     branching strategy, commit message style. These are lighter than hard constraints
     but still limit freedom and must be documented. -->

| Convention | Scope |
|---|---|
| All REST controllers use `@RequestMapping("/api")`; SPA/static and auth endpoints at root | Backend API layer |
| No CORS configuration — Vite proxy in dev, same-origin (or same-site) in prod | Frontend ↔ Backend integration (see ADR-002) |
| Backend uses Lombok; entities carry Bean Validation annotations | Backend model layer |
| Frontend uses MUI components, react-query for server state, axios client with `/api` baseURL | Frontend |
| Tests colocated: `src/tests/` tree with shared `renderWithProviders` util | Frontend testing |
| CI order: lint → test → build (frontend); test → build (backend) | CI pipelines |
| Flyway naming: `V{N}__{description}.sql` | Backend migrations |
