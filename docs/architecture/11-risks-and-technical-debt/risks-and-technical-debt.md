# 11. Risks and Technical Debt

<!-- https://docs.arc42.org/section-11/ -->

<!-- arc42 tip: Every architecture has risks and debt. Document them explicitly —
     hidden problems grow; visible ones get managed.
     "Risk management is project management for grown-ups."
     Review this section at each significant milestone or release.
     Consult multiple stakeholders — operations, security, and dev often see different risks. -->

## Risks

<!-- tip: A risk is a potential future problem with an uncertain probability.
     Prioritise by impact × likelihood.
     Include a concrete mitigation — "monitor it" is not a mitigation.
     Mark risks as Resolved once the mitigation is in place. -->

| ID | Risk | Impact | Likelihood | Status | Mitigation |
|---|---|---|---|---|---|
| R1 | **Password hashes leak via API.** Entities were serialised with owner + BCrypt hash. | High | High | Resolved | `@JsonIgnore` on `AppUser.password` and `BandEvent.appUser`; registration binds a `RegisterRequest` record. Full DTO layer still outstanding (TD3) |
| R2 | **Refresh token doubles as access token.** | High | Medium | Mitigated | `typ` claim (`access`/`refresh`) enforced in `JwtAuthenticationFilter` and `/api/refresh-token`. Still open: no server-side revocation — a leaked refresh token stays valid for 30 days after logout. **Accepted (2026-10-23):** refresh tokens are not rotated — `/api/refresh-token` builds a new cookie but deliberately never sends it, so sessions end 30 days after login regardless of activity. Owner decision; do not "fix" without asking |
| R3 | **Permissive fallback rule.** `anyRequest().permitAll()` | Medium | Medium | Resolved | Fallback is `denyAll()`; public routes are whitelisted explicitly |
| R4 | **JWT secret falls back to known defaults.** | High | Low | Resolved | `JwtUtils` hard-fails on a missing secret, < 32 bytes, or the docker-compose default strings (the compose fallbacks still exist but are rejected at startup) |
| R5 | **Rate limit key is spoofable.** `RateLimitFilter` trusted `X-Forwarded-For`; every distinct header value also added a permanent limiter entry (unbounded memory). | Medium | Medium | Resolved | Keyed on `remoteAddr` only, idle buckets evicted; `server.forward-headers-strategy=native` honours proxy headers only from internal proxy addresses. **Deployment check:** if the prod reverse proxy reaches the app from a public IP, all users share one bucket — configure `server.tomcat.remoteip.internal-proxies` |
| R6 | **Migrations are H2-flavoured.** | Medium | Medium | Resolved | Migrations use MySQL-compatible DDL; the CI e2e job boots a fresh MySQL stack |
| R7 | **Stale public docs mislead contributors.** | Low | High | Resolved | README rewritten against actual endpoints, compose profiles and the no-CORS design (2026-10-23) |
| R8 | Key-person dependency — solo owner holds all architecture knowledge (typical for hobby projects). | Medium | Low | Accepted | This arc42 documentation is the mitigation; keep it updated (§9 update-docs workflow) |

## Technical Debt

<!-- tip: Technical debt is a shortcut taken deliberately or discovered after the fact.
     Distinguish: deliberate debt (conscious trade-off), inadvertent debt (discovered mistake), bit rot.
     "Cost if left" makes the debt tangible for prioritisation.
     "Pay-down trigger" prevents debt from living forever without a plan. -->

| ID | Debt Item | Type | Cost if Left | Pay-down Trigger |
|---|---|---|---|---|
| TD1 | **Config that lies**: all `@Value` header fields (HSTS/CSP/frame-options/referrer/permissions-policy) and `corsEnabled` in `SecurityConfiguration` are injected but never read — the filter chain hardcodes the values; `JwtAuthenticationFilter.handleInvalidToken` is dead code | Inadvertent | Config changes silently have no effect; review/maintenance overhead | Next security-config change |
| TD2 | **Error-handling contract incomplete**: `ApiExceptionHandler` now maps not-found → 404 and missing auth → 401 (2026-10-23). Remaining: bean-validation failures return Boot's default 400 body, while the frontend's `apiErrors.ts` expects field errors on 422 | Inadvertent | Validation messages never reach the user in a structured way | Next entry-form change |
| TD3 | **Entities used as API DTOs**: `BandEventController` accepts/returns the JPA entity (`@Valid BandEvent`); only `@JsonIgnore` keeps the owner out | Deliberate | Over-posting risk if fields are added, API schema coupled to DB schema | Next `BandEvent` schema change |
| TD4 | ~~Frontend dependency drift: deprecated `react-query` v3 pinning React 18~~ | Inadvertent | — | **Resolved** 2026-10-23: `@tanstack/react-query` v5 + React 19; `web-vitals` 3+ still held (API change in `reportWebVitals.ts`) |
| TD5 | **Hardcoded prod domain** `concertjournal.de` in base `application.properties` (`auth.cookie.domain`, `server.servlet.session.cookie.domain`) and `application-production.properties`. Overridable via `AUTH_COOKIE_DOMAIN` | Deliberate | Other deployment targets must remember the override | Before adding any new environment |
| TD6 | **Inconsistent refresh-cookie attributes**: `AuthSuccessHandler` hardcodes `SameSite=Lax`, while `SecurityController` uses the configured `SameSite` (spring-session itself is gone) | Inadvertent | Cookie behaviour depends on which path set it | Next auth change |
| TD7 | ~~Duplicated ownership checks in `BandEventService`~~ | Inadvertent | — | **Resolved** 2026-10-23: single `currentUser()` helper |
| TD8 | **Docker-compose MySQL healthcheck hardcodes credentials** (`-u user -ppassword`) ignoring `${DATABASE_USER}` overrides | Inadvertent | Healthcheck fails (or passes wrongly) when credentials overridden via `.env` | Next compose change |
| TD9 | ~~Stale README~~ | Inadvertent | — | **Resolved** with R7 |
| TD10 | **Frontend debug leftovers**: class-component `App`, `NODE_ENV`-guarded `console.log` blocks in `AuthContext.tsx` (13) | Deliberate | Bundle and review noise | Next frontend refactor |
| TD11 | **Java package naming** `com.ConcertJournalAPI` violates lowercase convention | Deliberate | Cosmetic but complicates refactoring tooling expectations | Major backend refactor (renaming touches every file) |
| TD12 | ~~Held security fix: `.trivyignore` suppressed spring-webmvc CVE-2026-47884/47890~~ | Deliberate | — | **Resolved** 2026-10-23: Spring Boot 4.1.2 (spring-webmvc 7.0.10); suppressions deleted |

> Prioritised pay-down order (reviewed 2026-10-23): **R2 revocation → TD2 validation → TD3 DTOs**, then the hygiene items opportunistically.
