# ConcertJournal Security & Architecture Improvement Plan

## Phase 1: Critical Security Fixes
> No dependencies. Do first.

- [ ] **1.1 Remove refresh token from login JSON response**
  - **What:** `AuthSuccessHandler.onAuthenticationSuccess` writes `{"accessToken":"...", "refreshToken":"..."}` to the response body. The refresh token is also set as an HttpOnly cookie. Returning it in JSON exposes it to XSS.
  - **Backend change (`AuthSuccessHandler.java`):**
    - Change response body to `{"accessToken":"<token>"}` only (remove `refreshToken` from JSON)
    - Keep the HttpOnly cookie — that's the correct delivery mechanism
  - **Frontend change (`apiAuth.tsx`):**
    - Remove `refreshToken` from `LoginResponse` interface (only keep `accessToken`)
  - **Frontend change (`AuthContext.tsx`):**
    - Remove the `setRefreshToken` state variable entirely (it's never read — the cookie handles refresh)
  - **Frontend change (`useAuth.tsx`):**
    - No change needed — `onSuccess` only reads `data.accessToken`
  - **Verify:** Login still works, refresh still works via cookie

- [ ] **1.2 Add global exception handler + custom exceptions**
  - **What:** Service methods throw raw `RuntimeException` which produces 500 with stack traces. Need consistent error responses.
  - **Error response format** (matches Spring Boot default shape):
    ```json
    {"timestamp": "2024-...", "status": 404, "error": "Not Found", "message": "Event not found", "path": "/api/event/99"}
    ```
  - **New file `exception/ResourceNotFoundException.java`** — extends `RuntimeException`
  - **New file `exception/UnauthorizedException.java`** — extends `RuntimeException`
  - **New file `exception/ConflictException.java`** — extends `RuntimeException` (used later in 4.2 for duplicate registration, creating it now so the handler is complete)
  - **New file `exception/GlobalExceptionHandler.java`:**
    - `@RestControllerAdvice`
    - `@ExceptionHandler(ResourceNotFoundException.class)` → 404
    - `@ExceptionHandler(UnauthorizedException.class)` → 401
    - `@ExceptionHandler(ConflictException.class)` → 409
    - `@ExceptionHandler(MethodArgumentNotValidException.class)` → 400 with field errors
    - `@ExceptionHandler(Exception.class)` → 500 generic, log actual error
    - Helper method `buildErrorBody(HttpStatus, String message, String path)` → returns `Map<String,Object>` with `timestamp`, `status`, `error`, `message`, `path`
  - **Modify `BandEventService.java`:**
    - Replace `throw new RuntimeException("User is not authenticated")` → `throw new UnauthorizedException("...")`
    - Replace `throw new RuntimeException("Event not found")` → `throw new ResourceNotFoundException("...")`
    - `getEventById`: when `findByIdAndAppUser` returns empty → throw `ResourceNotFoundException("Event not found")`
  - **Verify:** `GET /api/event/999` → 404 JSON, invalid POST → 400, unauthenticated → 401

---

## Phase 2: Auth Workflow Fixes
> Core auth rework. Do as a unit. Items 2.1 and 2.6 are quick wins. 2.2 is a medium refactor. 2.3 is the largest effort and includes the JWT signature change needed by 3.1.

- [ ] **2.1 Make the refresh endpoint stateless**
  - **Change in `SecurityConfiguration.java`:**
    - Add `/api/refresh-token` to the `.requestMatchers(...).permitAll()` line
  - **Verify:** Delete all cookies except `refreshToken`, call `POST /api/refresh-token` → 200.

- [ ] **2.2 Refactor apiClient to support 401 interceptor with automatic retry**
  - **What:** The current `apiClient.tsx` is a React hook (`useApiClient`). Axios interceptors need access to the access token and a refresh function, but hooks can't be used outside React. Need to refactor to a plain module.
  - **Refactor `apiClient.tsx` from hook to plain module:**
    - Export a singleton `apiClient` Axios instance (not inside a hook)
    - Export `setAccessToken(token: string)` and `getAccessToken(): string` backed by a module-level `let`
    - Request interceptor: attach `Authorization: Bearer ${accessToken}` if token is set, plus existing CSRF logic
    - Response interceptor (new 401 retry logic):
      - Module-level: `let isRefreshing = false`, `let failedQueue: {resolve, reject, config}[]`
      - On 401, if URL is `/refresh-token` or `/login` → reject immediately (don't retry)
      - If `isRefreshing` → queue the request, return new Promise
      - Else: set `isRefreshing = true`, `POST /api/refresh-token`
        - Success: update module token, replay queued requests with new `Authorization` header
        - Failure: reject all queued, clear token
        - Finally: `isRefreshing = false`
  - **Update all consumers of `useApiClient()`:**
    - `apiAuth.tsx`: change from `useApiClient().apiClient` to plain import `apiClient`
    - `apiEvents.tsx`: same
    - `AuthContext.tsx`: import `apiClient` and `setAccessToken` from module; remove `useApiClient()` call
    - Change `EventsApi` from a hook-style function to a plain module (it uses `useApiClient` internally)
    - Change `useAuthApi` from a hook to a plain module
  - **Update `AuthContext.tsx`:**
    - Call `setAccessToken(token)` from the module whenever React state `token` changes (via `useEffect`)
    - Move `setInterval` inside `setupAuth`, after CSRF + refresh complete (fixes race 2.5)
    - Keep interval at 2.5 min as safety net
  - **Update `useEvents.tsx`:** adjust to new non-hook API imports
  - **Verify:** Let access token expire (3 min), make API call → auto-refresh + succeeds. Multiple concurrent 401s → only one refresh call.

- [ ] **2.3 Implement server-side refresh token storage + JWT role embedding**
  - **What:** Stateless refresh tokens can't be revoked. Also merges JWT signature change (needed by 3.1) to avoid rewriting code twice.
  - **New migration `V3__create_refresh_tokens_table.sql`:**
    ```sql
    CREATE TABLE refresh_tokens (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        token_hash VARCHAR(64) NOT NULL,
        user_id BIGINT NOT NULL,
        family_id VARCHAR(36) NOT NULL,
        revoked BOOLEAN NOT NULL DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token_hash (token_hash),
        INDEX idx_user_id (user_id),
        INDEX idx_family_id (family_id)
    );
    ```
  - **New entity `model/RefreshToken.java`:**
    - Fields: `id`, `tokenHash`, `@ManyToOne AppUser appUser`, `familyId`, `revoked`, `expiresAt`, `createdAt`
  - **New `repository/RefreshTokenRepository.java`:**
    - `Optional<RefreshToken> findByTokenHash(String hash)`
    - `@Modifying @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.familyId = :familyId") void revokeByFamilyId(String familyId)`
    - `@Modifying @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.appUser = :user") void revokeAllByUser(AppUser user)`
    - `void deleteByExpiresAtBefore(Instant cutoff)`
  - **New `service/RefreshTokenService.java`:**
    - Inject: `RefreshTokenRepository`, `AppUserRepository`
    - `String createRefreshToken(AppUser user, String familyId)`:
      - Call `JwtUtils.generateRefreshToken(user.getEmail(), user.getRole())`
      - Hash JWT with SHA-256 → hex
      - Save `RefreshToken` entity (hash, user, familyId, expiresAt = now + 30 days)
      - Return the raw JWT string
    - `RefreshTokenRotationResult validateAndRotate(String rawJwt)`:
      - Parse JWT, extract subject
      - Hash the raw JWT → look up in DB
      - If not found → throw (token unknown)
      - If revoked → **reuse detected**: revoke entire family, throw
      - Revoke the old token
      - Load `AppUser` by subject (if not found → throw)
      - Create new refresh token in same family
      - Return result object with: `newRefreshJwt`, `appUser`, `newAccessJwt`
    - `void revokeAllForUser(AppUser user)`
    - `@Scheduled(cron = "0 0 3 * * *") void cleanupExpired()` — delete expired tokens
    - Helper: `String sha256Hex(String input)` using `MessageDigest`
  - **Add `@EnableScheduling` to the main application class `ConcertJournalAPI.java`**
  - **Change `JwtUtils.java` signatures:**
    - `generateToken(Authentication auth)` → `generateToken(String subject, String role)` — add `.claim("role", role)`
    - `generateRefreshToken(Authentication auth)` → `generateRefreshToken(String subject, String role)` — add `.claim("role", role)`
  - **Modify `AuthSuccessHandler.java`:**
    - Remove `@Component` (it's already created via `@Bean` in SecurityConfig; having both causes ambiguity)
    - Inject `RefreshTokenService` and `AppUserRepository` via constructor (passed from the `@Bean` method)
    - On login: extract email from auth, load AppUser, extract role, generate `familyId = UUID.randomUUID()`, call `refreshTokenService.createRefreshToken(user, familyId)`
    - Call `JwtUtils.generateToken(email, role)` for access token
    - Response body: `{"accessToken":"..."}` only (from 1.1)
    - Set refresh token as HttpOnly cookie
  - **Modify `SecurityConfiguration.java`:**
    - Update `authSuccessHandler()` bean to inject `RefreshTokenService` and `AppUserRepository`
    - Add a custom `LogoutHandler` bean:
      - Extract user identity from the refresh token cookie (parse JWT, get subject), NOT from SecurityContext (which may be empty in stateless mode)
      - Call `refreshTokenService.revokeAllForUser(user)`
      - Delete the `refreshToken` cookie
    - Register the custom logout handler in the logout config
  - **Modify `SecurityController.java`:**
    - Inject `RefreshTokenService`
    - On refresh: call `refreshTokenService.validateAndRotate(oldToken)`
    - Use the returned `AppUser` to get current role
    - Generate new access token with `JwtUtils.generateToken(user.getEmail(), user.getRole())`
    - Set new refresh token as cookie, return access token JSON
  - **Verify:** Login creates DB row, refresh rotates, logout revokes all, reuse of old token revokes family.

- [ ] **2.4 Verify user existence on token refresh**
  - Handled within 2.3: `validateAndRotate` loads the user from DB. If deleted, FK cascade already removed tokens, so hash lookup fails → 401.

- [ ] **2.5 Fix CSRF/refresh race condition on mount**
  - Handled within 2.2: interval moves inside `setupAuth`.

- [ ] **2.6 Fix path-based refresh skip**
  - **Change in `AuthContext.tsx`:**
    - Replace `includes("sign-in")` / `includes("sign-up")` with `=== "/sign-in"` / `=== "/sign-up"`
  - **Verify:** Route containing "sign-in" as substring doesn't skip refresh.

---

## Phase 3: Authorization & Access Control
> 3.1 is mostly done via 2.3 (JWT role embedding). Remaining: load roles in filter + rate limiting.

- [ ] **3.1 Load roles from JWT in authentication filter**
  - **What:** The JWT signature change and role claim embedding are done in 2.3. This item makes the filter actually use the role.
  - **Modify `JwtAuthenticationFilter.authenticateUser(Claims claims)`:**
    - Extract `String role = claims.get("role", String.class)`
    - If role is not null: `List.of(new SimpleGrantedAuthority("ROLE_" + role))`
    - Else: `Collections.emptyList()` (backward compat for tokens issued before this change)
    - Use these authorities in `UsernamePasswordAuthenticationToken`
  - **Verify:** `@PreAuthorize("hasRole('USER')")` works. `@PreAuthorize("hasRole('ADMIN')")` works for admin user.

- [ ] **3.2 Return proper 404 for unauthorized event access**
  - Already handled by 1.2 — `BandEventService.getEventById` throws `ResourceNotFoundException`.

- [ ] **3.3 Add login-specific rate limiting**
  - **Modify `RateLimitFilter.java`:**
    - Add constant `AUTH_REQUESTS_PER_MINUTE = 5`
    - Add second LRU map `authLimiters` with same structure as `limiters`
    - `createAuthRateLimiter(String key)` — same pattern but with `AUTH_REQUESTS_PER_MINUTE`
    - `isAuthEndpoint(String path)` → `path.equals("/api/login") || path.equals("/api/register")`
    - In `doFilterInternal`: pick limiter map based on `isAuthEndpoint`
  - **Verify:** 6th login attempt within a minute → 429.

---

## Phase 4: Architecture Cleanup
> Depends on Phase 2.

- [ ] **4.1 Go fully stateless**
  - **Modify `SecurityConfiguration.java`:**
    - Add `.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`
    - Remove `.deleteCookies("JSESSIONID")` from logout config (keep `invalidateHttpSession(true)` — harmless no-op)
  - **Modify `pom.xml`:** Remove `spring-session-core` dependency
  - **Prerequisite:** 2.1 + 2.3 (logout handler extracts user from cookie, not session)
  - **Verify:** No `JSESSIONID` cookie after login. All auth flows still work.

- [ ] **4.2 Extract UserService**
  - **New file `service/UserService.java`:**
    - Constructor inject `AppUserRepository`, `PasswordEncoder`
    - `registerUser(RegisterRequest)`: duplicate check (throw `ConflictException`), encode password, set role "USER", save, return
  - **Modify `UserController.java`:** Inject `UserService`, delegate, return `ResponseEntity.status(201).body(...)`
  - `ConflictException` and its handler already created in 1.2.
  - **Verify:** Registration works, duplicate email → 409.

- [ ] **4.3 Register JwtAuthenticationFilter as a Spring bean**
  - **Modify `JwtAuthenticationFilter.java`:** Add `@Component`
  - **Modify `SecurityConfiguration.java`:** `@Autowired` the filter, replace `new JwtAuthenticationFilter()`
  - **Verify:** App starts, JWT auth works.

- [ ] **4.4 Clean up leftover session configuration**
  - **Remove `server.servlet.session.*` properties from:**
    - `application.properties`: `persistent`, `store-dir`, `cookie.same-site`, `cookie.secure`, `cookie.domain`
    - `application-dev.properties`: same set
    - `application-production.properties`: `cookie.same-site`, `cookie.secure`
  - **Add new property `auth.cookie.same-site`** to all profiles (Lax for prod/dev) to replace the deleted session cookie sameSite
  - **Update `SecurityConfiguration.java` and `SecurityController.java`:** change `@Value("${server.servlet.session.cookie.same-site:None}")` → `@Value("${auth.cookie.same-site:Lax}")`
  - **Prerequisite:** 4.1
  - **Verify:** App starts, cookies have correct SameSite attribute.

---

## Phase 5: Hardening
> Mostly independent. 5.4 is a feature, do last.

- [ ] **5.1 Lock down actuator endpoints**
  - **Modify `SecurityConfiguration.java`:**
    - Remove `/actuator/prometheus` from `permitAll()`
    - Add `.requestMatchers("/actuator/**").authenticated()` before the catch-all
  - **Modify `application-dev.properties`:**
    - Change `management.endpoints.web.exposure.include=*` → `management.endpoints.web.exposure.include=health,info,metrics,prometheus`
  - **Verify:** Unauthenticated `GET /actuator/prometheus` → 401.

- [ ] **5.2 Remove `unsafe-eval` from CSP**
  - **Modify `application.properties`, `application-dev.properties`, `application-production.properties`:**
    - `script-src 'self' 'unsafe-inline' 'unsafe-eval'` → `script-src 'self' 'unsafe-inline'`
  - **Verify:** Production build loads without CSP errors in browser console.

- [ ] **5.3 Strengthen password policy**
  - **Modify `RegisterRequest.java`:**
    - Add `@Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).+$", message = "Password must contain at least one letter and one digit.")`
  - **Modify `SignInCard.tsx`:** Change min from 6 → 8
  - **Modify `SignUpCard.tsx`:** Change min from 6 → 8, add hint about letter+digit
  - **Verify:** "12345678" fails, "abcdefgh" fails, "abcd1234" succeeds.

- [ ] **5.4 Add user account management (GDPR) — backend only**
  - **New DTO `dto/ChangePasswordRequest.java`:** `currentPassword`, `newPassword` (with same validation as RegisterRequest)
  - **Add to `UserService.java`:**
    - `changePassword(String email, ChangePasswordRequest req)`: verify current, encode new, save, revoke all refresh tokens
    - `deleteAccount(String email)`: load user, delete (cascade handles events + refresh tokens)
  - **Add to `UserController.java`:**
    - `PUT /api/me/password` → 200
    - `DELETE /api/me` → 204
  - **Modify `HomeController.java` `GET /api/me`:** return `AppUser` object instead of plain string
  - **Frontend:** Defer to a separate task — just log a TODO. The backend API is what matters for GDPR compliance.
  - **Verify:** Password change invalidates old tokens. Account deletion removes all data.

- [ ] **5.5 Harden DataLoader**
  - **Modify `DataLoader.java`:** Generate random password via `UUID.randomUUID().toString().substring(0, 12)`, log it
  - **Verify:** Fresh DB start → random password in logs.

---

## Phase 6: Performance & Minor
> Low priority.

- [ ] **6.1 Fix MetricsConfig query**
  - **Add to `BandEventRepository.java`:**
    `@Query("SELECT COUNT(DISTINCT CONCAT(e.bandName, '-', e.date)) FROM BandEvent e") long countUniqueBandEvents();`
  - **Modify `MetricsConfig.java`:** Call repository method instead of loading all events.
  - **Verify:** Same metric value, no full table scan.

- [ ] **6.2 Fix SpaController catch-all**
  - **Modify `SpaController.java`:**
    - Add `@RequestMapping(value = "/{path:[^\\.]*}/**")` as second mapping to catch nested routes like `/edit-entry/123`
  - **Verify:** Hard refresh on `/edit-entry/123` in production mode → React app loads.

- [ ] **6.3 Set httpOnly=true for auth cookies in dev**
  - **Modify `application-dev.properties`:** `auth.cookie.httpOnly=false` → `auth.cookie.httpOnly=true`
  - **Verify:** Dev login works, cookies are HttpOnly.

---

## Execution Order

```
Phase 1 (1 day)
  1.1 → 1.2

Phase 2 (3-5 days)
  2.1 + 2.6 (quick, independent)
  2.2 (apiClient refactor + 401 interceptor)
  2.3 (server-side tokens + JWT role claims — largest item)

Phase 3 (1 day)
  3.1 + 3.3 (3.2 already done in 1.2)

Phase 4 (1-2 days)
  4.1 → 4.4 → 4.2 → 4.3

Phase 5 (2-3 days)
  5.1, 5.2, 5.3, 5.5 (parallel)
  5.4 (backend only, frontend deferred)

Phase 6 (half day)
  6.1, 6.2, 6.3 (parallel)
```

---

## Progress Log

_Updated as items are completed._

| Item | Status | Date | Notes |
|------|--------|------|-------|
| 1.1 Remove refresh token from JSON | Done | 2026-04-27 | Backend + frontend |
| 1.2 Global exception handler | Done | 2026-04-27 | 3 custom exceptions + @RestControllerAdvice |
| 2.1 Refresh endpoint permitAll | Done | 2026-04-27 | Added to SecurityConfiguration |
| 2.2 apiClient refactor + 401 interceptor | Done | 2026-04-27 | Hook -> plain module, retry queue, updated all consumers + tests |
| 2.3 Server-side refresh tokens + JWT roles | Done | 2026-04-27 | V3 migration, RefreshToken entity, RefreshTokenService, token rotation, family reuse detection |
| 2.6 Fix path-based refresh skip | Done | 2026-04-27 | includes() -> === |
| 3.1 Load roles from JWT in filter | Done | 2026-04-27 | SimpleGrantedAuthority from role claim |
| 3.3 Login-specific rate limiting | Done | 2026-04-27 | 5 req/min for /api/login and /api/register |
| 4.1 Go fully stateless | Done | 2026-04-27 | SessionCreationPolicy.STATELESS, removed spring-session-core |
| 4.2 Extract UserService | Done | 2026-04-27 | Registration logic moved to service layer |
| 4.3 JwtAuthenticationFilter as bean | Done | 2026-04-27 | @Component + @Autowired |
| 4.4 Clean up session config | Done | 2026-04-27 | Removed session properties, added auth.cookie.same-site |
| 5.1 Lock down actuator | Done | 2026-04-27 | Requires auth, dev exposure restricted |
| 5.2 Remove unsafe-eval from CSP | Done | 2026-04-27 | All profiles |
| 5.3 Strengthen password policy | Done | 2026-04-27 | Backend @Pattern + frontend min 8 |
| 5.4 GDPR account management | Done | 2026-04-27 | PUT /api/me/password, DELETE /api/me, GET /api/me returns AppUser |
| 5.5 Harden DataLoader | Done | 2026-04-27 | Random UUID password logged to console |
| 6.1 Fix MetricsConfig query | Done | 2026-04-27 | @Query in repository |
| 6.2 Fix SpaController catch-all | Done | 2026-04-27 | Added /** pattern for nested routes |
| 6.3 httpOnly=true in dev | Done | 2026-04-27 | application-dev.properties |

### Pre-existing issues noted (not in scope):
- `App.test.tsx` fails because it renders real AuthProvider without mocks (1 test)
- `CookieCsrfTokenRequestHandlerTest.java` references deleted class (test compile error, pre-existing on branch)
