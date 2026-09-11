# 9. Architecture Decisions

<!-- https://docs.arc42.org/section-9/ -->

<!-- arc42 tip: Capture decisions that are architecturally significant — those that affect
     structure, quality characteristics, key dependencies, or cross-cutting techniques.
     Use Architecture Decision Records (ADRs) in the Nygard format.
     Document rejected alternatives: they prevent relitigating closed debates.
     Keep old ADRs — mark them Deprecated or Superseded rather than deleting them.
     For decisions already summarised in section 4, link here rather than duplicating. -->

> The ADRs below were reconstructed from the codebase (no historical ADR log exists in the repo).
> Dates are approximations based on git history.

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| ADR-001 | Monorepo with path-triggered CI | Accepted | 2024 |
| ADR-002 | No CORS — Vite proxy in dev, same-origin container in prod | Accepted | 2025 |
| ADR-003 | JWT access token (3 min) + refresh cookie (30 days) | Accepted | 2025 |
| ADR-004 | CSRF via double-submit cookie with SameSite=None | Accepted | 2025 |
| ADR-005 | Flyway for schema management, JPA validate-only | Accepted | 2025 |
| ADR-006 | Spring Boot serves the built SPA in production | Accepted | 2025 |
| ADR-007 | Hybrid dev mode (local Vite + Docker backend) | Accepted | 2025 |

---

## ADR-001 — Monorepo with path-triggered CI

**Status:** Accepted
**Date:** 2024

### Context

Frontend and backend are developed by a single person who wants one PR to potentially touch both
tiers, while CI minutes should not be wasted rebuilding the unaffected tier.

### Decision

We will keep frontend and backend in one repository and trigger the respective CI workflows
based on changed paths (`backend/**` / `frontend/**` via `dorny/paths-filter`).

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Monorepo with path filters (chosen) | Atomic cross-tier changes, cheap CI | Requires change-detection workflow |
| Two repositories | Independent versioning | Cross-tier changes need two PRs; local dev wiring duplicated |

### Consequences

- **Positive:** One checkout, one `docker-compose.yml` for the full stack, cross-tier refactorings are single commits.
- **Negative:** CI workflow graph is more complex (orchestrator + reusable workflows + version tagging).
- **Neutral:** Version tag `v{N}` applies to the whole repo, not per component.

---

## ADR-002 — No CORS — Vite proxy in dev, same-origin container in prod

**Status:** Accepted (partially challenged by the `api.concertjournal.de` split-domain setup, see §7 uncertainty)

### Context

SPA on `:3000`, backend on `:8080` in dev; browser cookie rules and CORS preflight add friction
and security configuration surface. The repo's `AGENTS.md` mandates "No CORS config".

### Decision

We will avoid CORS entirely: in development the Vite dev server proxies `/api` to
`http://localhost:8080/api`; in production the Spring Boot container serves the SPA itself so
that everything is same-origin.

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Same-origin / proxy (chosen) | No CORS headers, cookies "just work" | Backend must host static files |
| Spring `@CrossOrigin` / global CORS config | Flexible split hosting | Preflights, credential rules, larger attack surface |

### Consequences

- **Positive:** Zero CORS misconfiguration class; simpler security filter chain (`cors.disable()`).
- **Negative:** The split-domain option (`api.concertjournal.de`) reintroduces cross-site cookies — handled via `SameSite=None` + cookie `Domain=concertjournal.de` (ADR-004), which weakens CSRF posture and hardcodes the domain.
- **Neutral:** `corsEnabled` config property remains as dead configuration (§11 TD1).

---

## ADR-003 — JWT access token (3 min) + refresh cookie (30 days)

**Status:** Accepted

### Context

The SPA needs authenticated REST calls; sessions should survive page reloads without a
server-side session store, while limiting the damage window of a stolen token. A very short
access token lifetime was chosen; the frontend refreshes every 2 minutes.

### Decision

We will use symmetric HMAC JWTs: a 3-minute access token delivered in the login response body
(and kept in React state) and a 30-day refresh token delivered as a cookie, rotated on every
`POST /api/refresh-token`.

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Short JWT + rotating refresh cookie (chosen) | Small damage window, stateless | Refresh chatter; no revocation |
| Spring Security sessions (JSESSIONID) | Simple, revocable | Server session state; already half-present in code (§11 TD6) |
| Opaque tokens in DB | Revocable, no crypto pitfalls | Requires token table & lookup |

### Consequences

- **Positive:** Stateless auth; stolen access token expires in 3 minutes; refresh token rotation.
- **Negative:** Both token types share key and claims shape — the refresh token is accepted as an access token, and there is no server-side revocation (§11 R2). Logout does not invalidate tokens.
- **Neutral:** Frontend must run a refresh interval; CSRF protection needed on the refresh endpoint.

---

## ADR-004 — CSRF via double-submit cookie with SameSite=None

**Status:** Accepted

### Context

The SPA may be served from a sibling subdomain of the API (`concertjournal.de` /
`api.concertjournal.de`), so cookies cross sites and `SameSite=Lax` would block the refresh
cookie. Spring Security's SPA guidance recommends the double-submit pattern with a
JavaScript-readable CSRF cookie.

### Decision

We will use `CookieCsrfTokenRepository` with a non-httpOnly `XSRF-TOKEN` cookie
(`SameSite=None`, forced `Secure`, `Domain=concertjournal.de`) and validate the `X-XSRF-TOKEN`
header on every mutating request.

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Double-submit cookie (chosen) | Standard Spring Security SPA pattern | Cookie domain/attributes hardcoded in two places |
| Disable CSRF (common SPA shortcut) | Zero friction | Unacceptable for a credential-handling app |

### Consequences

- **Positive:** BREACH-protected XOR tokens optional; familiar pattern; browser enforces `Secure` with `SameSite=None`.
- **Negative:** Works only on/for `concertjournal.de` — breaks local non-proxied setups (§11 TD5); two independent cookie-writing code paths (CSRF repository + `SecurityController`) can drift.

---

## ADR-005 — Flyway for schema management, JPA validate-only

**Status:** Accepted

### Context

Schema must evolve reproducibly across H2 (default profile) and MySQL (dev/prod), on Docker
volumes that outlive containers.

### Decision

We will manage the schema exclusively through versioned Flyway SQL migrations
(`classpath:db/migration`) and set `spring.jpa.hibernate.ddl-auto=validate`.

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Flyway (chosen) | Versioned, auditable, runs on startup | Migration SQL must work on both H2 and MySQL |
| Hibernate auto-DDL | Zero migration files | Drift, no history, unsafe with existing data |

### Consequences

- **Positive:** Reproducible schema; startup fails fast on drift (`validate-on-migrate=true`).
- **Negative:** Current scripts use H2-flavoured syntax (`CREATE INDEX IF NOT EXISTS`) that MySQL does not accept — masked by `baseline-on-migrate=true` (§11 R6).
- **Neutral:** `baseline-on-migrate` must stay enabled for pre-Flyway databases.

---

## ADR-006 — Spring Boot serves the built SPA in production

**Status:** Accepted

### Context

Self-hosting on a single NAS container; a separate static file server (nginx) would double the
service count and re-introduce CORS or proxy configuration.

### Decision

We will build the SPA with Vite in a Docker build stage, copy `dist/` into the JAR container at
`/app/static/`, and serve it via `SpaController` (forwarding non-file paths to `index.html`).

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Backend-hosted SPA (chosen) | One service, same-origin, no CORS | Backend image rebuild for every frontend change |
| nginx container for SPA | Independent scaling/deployment | Two services, cross-origin or extra proxy |

### Consequences

- **Positive:** Single port (8080) serves everything; graceful shutdown covers the whole app.
- **Negative:** Frontend-only changes produce a new multi-arch image including backend layers; deeper Docker layer caching partially compensates.

---

## ADR-007 — Hybrid dev mode (local Vite + Docker backend)

**Status:** Accepted

### Context

Full-Docker development has slow HMR (polling instead of native fs events); pure-local backend
requires a local MySQL. The best developer experience combines both.

### Decision

We will run MySQL and the backend as Docker Compose services (`--profile dev`) and the frontend
locally via `npm run start:local` (Vite, native HMR, `/api` proxy), orchestrated by
`local-dev.sh`.

### Considered Alternatives

| Alternative | Pro | Con |
|---|---|---|
| Hybrid (chosen) | Fast HMR, consistent backend env, zero CORS | Two processes to manage |
| Full Docker | One command | Slow HMR (polling) |
| Fully local | No Docker needed | Local MySQL/Java setup drift |

### Consequences

- **Positive:** Sub-second frontend feedback; documented in `local-dev.sh` + AGENTS.md.
- **Negative:** Dev/prod parity gap (no TLS, no proxy locally — cookie attributes untestable, see §7).

---

<!-- tip: Copy the ADR-001 block for each new decision.
     Increment the number sequentially.
     When a decision is superseded, update the status and add "Superseded by ADR-XXX" in the index. -->
