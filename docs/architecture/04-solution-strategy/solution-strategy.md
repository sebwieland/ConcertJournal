# 4. Solution Strategy

<!-- https://docs.arc42.org/section-4/ -->

<!-- arc42 tip: One-page executive summary of the key architectural decisions.
     Answer: what technology, what decomposition, how are quality goals achieved?
     Keep it compact — keywords and short phrases are fine.
     Link to section 5 (building blocks) and section 8 (concepts) for detail.
     Full rationale for individual decisions lives in section 9 (ADRs). -->

## Technology Decisions

<!-- tip: One line per major choice. Include the "why" in a single phrase.
     Readers should be able to understand the technology stack without opening section 9. -->

| Decision | Choice | Key reason |
|---|---|---|
| Language / Runtime (backend) | Java 21 / Spring Boot 3.4 | Mature security & JPA ecosystem; team familiarity |
| Frontend framework | React 18 + TypeScript 5, Vite 5 | SPA with fast HMR dev loop |
| UI library | MUI v7 (+ x-data-grid, x-date-pickers) | Ready-made data table & date pickers for the journal |
| Server state (frontend) | react-query v3 | Caching/refetching of journal data |
| Primary database | MySQL 8 (Docker volume) | Self-hosted, runs on NAS; H2 as embedded default-profile fallback |
| Schema management | Flyway (`V{N}__*.sql`) | Reproducible migrations on every startup |
| Auth | Spring Security formLogin + JWT (jjwt) | Stateless access tokens (3 min) + refresh cookie (30 days) |
| CSRF | Double-submit cookie (`XSRF-TOKEN`), `SameSite=None` | SPA on a sibling subdomain sends cross-site cookies |
| Deployment | Single multi-stage Docker image (frontend static + backend JAR) | One service to host; same-origin in prod avoids CORS |
| CI/CD | GitHub Actions, path-triggered, multi-arch images to private registry | Fast solo-developer loop |
| Observability | Actuator + Micrometer Prometheus | Scrapeable metrics on self-hosted infra |

## Achieving Quality Goals

<!-- tip: Map each top quality goal from section 1.2 to the concrete approach that achieves it.
     This shows stakeholders that quality goals are not wishful thinking but driven by specific decisions. -->

| Quality Goal | Architectural approach | See also |
|---|---|---|
| Security | Spring Security filter chain (JWT + CSRF + OWASP headers), BCrypt password encoding, per-user scoping in `BandEventService`, Resilience4j rate limiting | §8 Crosscutting Concepts, ADR-003 |
| Operability | One container, `/actuator/health` Docker healthcheck, graceful shutdown, Prometheus metrics | §7 Deployment View |
| Maintainability | Monorepo with path-triggered CI (lint → test → build both sides), test suites on frontend and backend | §10 Quality Requirements |
| Usability (developer) | Hybrid dev mode: Vite dev server proxies `/api` to Docker backend — no CORS config anywhere | §7 Deployment View, ADR-002 |
| Portability | Multi-arch images; profile-specific properties (default=H2, dev=MySQL, prod=env-driven MySQL) | §2 Constraints |

## Top-Level Decomposition

<!-- tip: One short paragraph on how the system is split — layers, microservices, modules, or packages.
     This is the prose companion to the Level-1 diagram in section 5. -->

The system is a classic two-tier monolith: a **React SPA** (built with Vite, served as static
files) and a **layered Spring Boot backend** (controller → service → repository → MySQL).
There is no message queue, no worker, and no microservice split. In production both tiers ship
inside one Docker container — the backend serves the compiled SPA from `/app/static/` via
`SpaController`, making the deployment same-origin. The frontend talks to the backend
exclusively through the `/api` REST namespace (plus root-level auth endpoints mandated by
Spring Security).
