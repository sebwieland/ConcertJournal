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
| R1 | **Password hashes leak via API.** `BandEvent.appUser` (`model/BandEvent.java:39`) and `AppUser.password` (`model/AppUser.java:31`) are serialised — `/api/allEvents` and `/api/event/{id}` responses include the owner's BCrypt hash, email, and role. No DTO layer. | High | High (happens on every event response) | Open | Introduce DTOs (or at minimum `@JsonIgnore` on `password` + `appUser`) and regression-test response payloads |
| R2 | **Refresh token doubles as access token.** `generateToken` and `generateRefreshToken` (`security/JwtUtils.java:22-38`) differ only in expiry; same key, no token-type claim, no revocation. A leaked 30-day refresh token grants full API access; logout does not invalidate it. | High | Medium | Open | Add a `typ` claim (access/refresh), reject refresh tokens in `JwtAuthenticationFilter`, consider server-side revocation on logout |
| R3 | **Permissive fallback rule.** `anyRequest().permitAll()` (`configuration/SecurityConfiguration.java:176`) — any future endpoint not explicitly under `/api/**` is public by default. | Medium | Medium | Open | Change to `denyAll()`/`authenticated()` and whitelist explicitly |
| R4 | **JWT secret falls back to known defaults.** docker-compose uses `${JWT_SECRET:-dev-secret-change-in-production}` / `:-change-me-in-production`; a prod container started without the env var runs with a publicly known secret (application itself fails fast via `JwtUtils` only when the env var is missing, not when it is weak). | High | Low (requires missing env) | Open | Fail startup on default/short secrets; enforce minimum key length (HMAC-SHA256 needs ≥ 32 bytes) |
| R5 | **Rate limit key is spoofable.** `RateLimitFilter` trusts `X-Forwarded-For` — a client that reaches the app without a sanitizing proxy can bypass limiting or exhaust another IP's budget. | Medium | Medium | Open | Configure trusted proxy or use `remoteAddr` only |
| R6 | **Migrations are H2-flavoured.** `CREATE INDEX IF NOT EXISTS` (`V2__create_band_events_table.sql:15`) is invalid MySQL; `baseline-on-migrate=true` currently masks this on existing DBs, but a **fresh** MySQL deployment would fail. | Medium | Medium | Open | Test a fresh MySQL `docker-compose down -v` run; split H2/MySQL migrations or use MySQL-compatible syntax |
| R7 | **Stale public docs mislead contributors.** README documents endpoints (`/api/events`, `/api/users`, `/api/auth`) and CORS troubleshooting that do not match the implementation. | Low | High | Open | Regenerate README from actual endpoints; add link to this documentation |
| R8 | Key-person dependency — solo owner holds all architecture knowledge (typical for hobby projects). | Medium | Low | Accepted | This arc42 documentation is the mitigation; keep it updated (§9 update-docs workflow) |

## Technical Debt

<!-- tip: Technical debt is a shortcut taken deliberately or discovered after the fact.
     Distinguish: deliberate debt (conscious trade-off), inadvertent debt (discovered mistake), bit rot.
     "Cost if left" makes the debt tangible for prioritisation.
     "Pay-down trigger" prevents debt from living forever without a plan. -->

| ID | Debt Item | Type | Cost if Left | Pay-down Trigger |
|---|---|---|---|---|
| TD1 | **Config that lies**: `@Value` fields for HSTS/CSP/frame-options/referrer/permissions/CORS (`SecurityConfiguration.java:47-77`) are injected but never used — the filter chain hardcodes the values; `SpaCsrfTokenRequestHandler` (line 193) and `JwtAuthenticationFilter.handleInvalidToken` are dead code; `corsEnabled` unused | Inadvertent | Config changes silently have no effect; review/maintenance overhead; misleading for future changes | Next security-config change |
| TD2 | **No error-handling contract**: no `@ControllerAdvice`; `BandEventService` throws bare `RuntimeException` (→ 500) and `getEventById` returns `null` (→ 200 empty body) | Inadvertent | Users see 500s for expected cases; frontend can't distinguish error types | Before next API feature |
| TD3 | **Entities used as API DTOs**: controllers accept/return JPA entities (`@RequestBody AppUser`, `@Valid BandEvent`) — cause of R1 and couples API schema to DB schema | Deliberate | Security (R1), over-posting risk (`register` binds arbitrary fields), migration friction | With R1 fix |
| TD4 | **Frontend dependency drift**: deprecated `react-query` v3 (superseded by `@tanstack/react-query` v5); `react`/`react-dom` 18.2 with `@types/react` 19; `typescript`/`vite` in `dependencies` instead of `devDependencies`; MUI v7 with x-data-grid v7 | Inadvertent | Type-checker/runtime mismatches; dead-package security noise | Next dependency update round |
| TD5 | **Hardcoded prod domain** `concertjournal.de` in three places (`SecurityConfiguration.java:116`, `SecurityController.java:75,103`, base `application.properties`) | Deliberate | Breaks any other deployment target; local cookie debugging confusing | Before adding any new environment |
| TD6 | **Two parallel auth mechanisms**: spring-session (JSESSIONID, persistent `./sessionTmp`) coexists with stateless JWT; `AuthSuccessHandler` sets refresh cookie `SameSite=Lax` while `SecurityController` uses configured `SameSite` — inconsistent attributes | Inadvertent | Auth behaviour depends on which path set the cookie; session store on prod disk | With R2 remediation (pick one mechanism) |
| TD7 | **Duplicated ownership checks**: authentication → `findByEmail` → scope copy-pasted five times in `BandEventService` | Inadvertent | Divergence risk on next repository method | Next service change (extract helper or use method security) |
| TD8 | **Docker-compose MySQL healthcheck hardcodes credentials** (`-u user -ppassword`, `docker-compose.yml:30`) ignoring `${DATABASE_USER}` overrides | Inadvertent | Healthcheck fails (or passes wrongly) when credentials overridden via `.env` | Next compose change |
| TD9 | **Stale README** (see R7): H2-vs-MySQL description, wrong endpoints, CORS troubleshooting contradicting ADR-002 | Inadvertent | Onboarding friction; agents/AI assistants follow wrong docs | Next docs pass |
| TD10 | **Frontend dead code / style drift**: empty `componentDidMount`/`componentWillUnmount` stubs in `App.tsx:23-29`, class-component App, extensive `NODE_ENV`-guarded `console.log` blocks in `AuthContext.tsx` | Deliberate (debug leftovers) | Bundle noise, review noise | Next frontend refactor |
| TD11 | **Java package naming** `com.ConcertJournalAPI` violates lowercase convention | Deliberate | Cosmetic but complicates refactoring tooling expectations | Major backend refactor (renaming touches every file) |

> Prioritised pay-down order suggested: **R1/TD3 → R2 → R3 → TD1 → TD2 → R6**, then the hygiene items opportunistically.
