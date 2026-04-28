# Authentication Flow

## Initial Page Load

```
  Browser                    Frontend (AuthContext)              Backend
  ───────                    ─────────────────────              ───────
     │                              │                              │
     │  mount AuthProvider          │                              │
     │─────────────────────────────>│                              │
     │                              │                              │
     │                              │  GET /api/get-xsrf-cookie    │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                              │  Set-Cookie: XSRF-TOKEN=abc │
     │                              │<─────────────────────────────│
     │                              │                              │
     │                              │  POST /api/refresh-token     │
     │                              │  Cookie: refreshToken=...    │
     │                              │  (if cookie exists from       │
     │                              │   previous session)           │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                      ┌───────┴───────┐                      │
     │                      │ Cookie found? │                      │
     │                      └───────┬───────┘                      │
     │                     yes/     \no                             │
     │                    /          \                              │
     │          ┌────────┐    ┌──────────┐                         │
     │          │LOGGED  │    │SHOW      │                         │
     │          │IN      │    │SIGN-IN   │                         │
     │          └────────┘    └──────────┘                         │
```

## Login

```
  Browser                    Frontend                           Backend
  ───────                    ────────                           ───────
     │  submit email+pass          │                              │
     │────────────────────────────>│                              │
     │                              │                              │
     │                              │  POST /api/login             │
     │                              │  Content-Type: url-encoded   │
     │                              │  X-XSRF-TOKEN: abc           │
     │                              │  email=...&password=...      │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                              │            ┌─────────────────┤
     │                              │            │ Spring Security │
     │                              │            │ formLogin()     │
     │                              │            │ verifies creds  │
     │                              │            │ via BCrypt      │
     │                              │            └────────┬────────┤
     │                              │                     │        │
     │                              │            ┌────────▼────────┤
     │                              │            │AuthSuccessHandler│
     │                              │            │                 │
     │                              │            │ 1. Load AppUser │
     │                              │            │ 2. Extract role │
     │                              │            │ 3. Generate     │
     │                              │            │    access JWT   │
     │                              │            │    (3 min, has  │
     │                              │            │     role claim) │
     │                              │            │ 4. Create       │
     │                              │            │    refresh JWT  │
     │                              │            │    (30 days)    │
     │                              │            │ 5. SHA-256 hash │
     │                              │            │    refresh JWT  │
     │                              │            │ 6. Store hash   │
     │                              │            │    in DB with   │
     │                              │            │    family_id    │
     │                              │            └────────┬────────┤
     │                              │                     │        │
     │                              │  200 OK                      │
     │                              │  {"accessToken":"eyJ..."}    │
     │                              │  Set-Cookie: refreshToken=   │
     │                              │    eyJ...; HttpOnly; Secure; │
     │                              │    SameSite=Lax; Path=/;     │
     │                              │    Max-Age=2592000           │
     │                              │<─────────────────────────────│
     │                              │                              │
     │                  ┌───────────┤                              │
     │                  │ Store     │                              │
     │                  │ accessToken                              │
     │                  │ in memory │                              │
     │                  │ (module   │                              │
     │                  │  variable)│                              │
     │                  └───────────┤                              │
     │                              │                              │
     │  redirect to /               │                              │
     │<─────────────────────────────│                              │
```

## Authenticated API Request

```
  Browser                    Frontend (apiClient)               Backend
  ───────                    ────────────────────               ───────
     │  user action                 │                              │
     │─────────────────────────────>│                              │
     │                              │                              │
     │                  ┌───────────┤                              │
     │                  │ Request   │                              │
     │                  │interceptor│                              │
     │                  │adds:      │                              │
     │                  │ Auth:     │                              │
     │                  │  Bearer   │                              │
     │                  │  <token>  │                              │
     │                  │ X-XSRF-  │                              │
     │                  │  TOKEN    │                              │
     │                  └───────────┤                              │
     │                              │                              │
     │                              │  GET /api/allEvents          │
     │                              │  Authorization: Bearer eyJ...│
     │                              │  X-XSRF-TOKEN: abc           │
     │                              │  Cookie: refreshToken=...    │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                              │          ┌───────────────────┤
     │                              │          │JwtAuthFilter      │
     │                              │          │ 1. Extract Bearer │
     │                              │          │ 2. Verify sig+exp │
     │                              │          │ 3. Check type=    │
     │                              │          │    "access"       │
     │                              │          │ 4. Extract role   │
     │                              │          │ 5. Set SecurityCtx│
     │                              │          │    with ROLE_USER │
     │                              │          └───────────────────┤
     │                              │                              │
     │                              │  200 OK [{...}, {...}]       │
     │                              │<─────────────────────────────│
     │  render data                 │                              │
     │<─────────────────────────────│                              │
```

## Token Refresh (automatic)

Triggered by: 401 response OR 2.5-minute interval.

```
  Browser                    Frontend (apiClient)               Backend
  ───────                    ────────────────────               ───────
     │                              │                              │
     │  API call returns 401        │                              │
     │  (token expired)             │                              │
     │                              │                              │
     │                  ┌───────────┤                              │
     │                  │ 401       │                              │
     │                  │interceptor│                              │
     │                  │ queues    │                              │
     │                  │ failed    │                              │
     │                  │ request   │                              │
     │                  └───────────┤                              │
     │                              │                              │
     │                              │  POST /api/refresh-token     │
     │                              │  Cookie: refreshToken=eyJ... │
     │                              │  (no Auth header needed -    │
     │                              │   endpoint is permitAll)     │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                              │       ┌──────────────────────┤
     │                              │       │RefreshTokenService   │
     │                              │       │ .validateAndRotate() │
     │                              │       │                      │
     │                              │       │ 1. Parse JWT (sig+   │
     │                              │       │    expiry check)     │
     │                              │       │ 2. SHA-256 hash it   │
     │                              │       │ 3. Look up hash in DB│
     │                              │       │ 4. Check not revoked │
     │                              │       │    ┌─────────────┐   │
     │                              │       │    │If revoked:  │   │
     │                              │       │    │THEFT DETECTED│   │
     │                              │       │    │Revoke entire │   │
     │                              │       │    │family -> 401 │   │
     │                              │       │    └─────────────┘   │
     │                              │       │ 5. Revoke old token  │
     │                              │       │ 6. Verify user exists│
     │                              │       │ 7. Create new refresh│
     │                              │       │    token (same family)│
     │                              │       │ 8. Generate new      │
     │                              │       │    access token      │
     │                              │       └──────────────────────┤
     │                              │                              │
     │                              │  200 OK                      │
     │                              │  {"accessToken":"eyJ...(new)"}│
     │                              │  Set-Cookie: refreshToken=   │
     │                              │    eyJ...(new); HttpOnly     │
     │                              │<─────────────────────────────│
     │                              │                              │
     │                  ┌───────────┤                              │
     │                  │ Update    │                              │
     │                  │ module    │                              │
     │                  │ token     │                              │
     │                  │           │                              │
     │                  │ Replay    │                              │
     │                  │ queued    │                              │
     │                  │ requests  │                              │
     │                  │ with new  │                              │
     │                  │ token     │                              │
     │                  └───────────┤                              │
     │                              │                              │
     │  original request succeeds   │                              │
     │<─────────────────────────────│                              │
```

## Logout

```
  Browser                    Frontend                           Backend
  ───────                    ────────                           ───────
     │  click logout               │                              │
     │────────────────────────────>│                              │
     │                              │                              │
     │                              │  POST /api/logout            │
     │                              │  Cookie: refreshToken=eyJ... │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                              │       ┌──────────────────────┤
     │                              │       │ LogoutHandler        │
     │                              │       │ 1. Parse refresh     │
     │                              │       │    cookie -> email   │
     │                              │       │ 2. Revoke ALL tokens │
     │                              │       │    for this user     │
     │                              │       │    in DB             │
     │                              │       │ 3. Delete refresh    │
     │                              │       │    cookie            │
     │                              │       └──────────────────────┤
     │                              │                              │
     │                              │  200 OK                      │
     │                              │  Set-Cookie: refreshToken=;  │
     │                              │    Max-Age=0                 │
     │                              │<─────────────────────────────│
     │                              │                              │
     │                  ┌───────────┤                              │
     │                  │ Clear     │                              │
     │                  │ memory    │                              │
     │                  │ token     │                              │
     │                  │           │                              │
     │                  │ Clear     │                              │
     │                  │ isLoggedIn│                              │
     │                  └───────────┤                              │
     │                              │                              │
     │  redirect to /sign-in        │                              │
     │<─────────────────────────────│                              │
```

## Token Theft Detection

Scenario: Attacker captured an old refresh token before it was rotated.
The legitimate user has since refreshed (rotating to a new token).

```
  Attacker                                                     Backend
  ────────                                                     ───────
     │                                                            │
     │  POST /api/refresh-token                                   │
     │  Cookie: refreshToken=<OLD stolen token>                   │
     │───────────────────────────────────────────────────────────>│
     │                                                            │
     │                              ┌─────────────────────────────┤
     │                              │ RefreshTokenService          │
     │                              │ 1. Hash the token            │
     │                              │ 2. Find in DB -> found       │
     │                              │ 3. Check revoked -> YES!     │
     │                              │ 4. REUSE DETECTED            │
     │                              │ 5. Revoke ENTIRE family      │
     │                              │    (attacker + legit user    │
     │                              │     both lose access)        │
     │                              │ 6. Log warning               │
     │                              └─────────────────────────────┤
     │                                                            │
     │  401 Unauthorized                                          │
     │<───────────────────────────────────────────────────────────│
     │                                                            │
     │  Legitimate user's next refresh also fails -> forced to    │
     │  re-login (password required), confirming account security  │
```

## Where Tokens Live

### Access Token
| Property | Value |
|----------|-------|
| Location | JavaScript module variable (`apiClient.tsx`) |
| Lifetime | 3 minutes |
| Contains | subject (email), role, type="access" |
| Sent via | `Authorization: Bearer` header |
| XSS risk | In memory only, not in storage |
| Survives page refresh | No (re-obtained via refresh token) |

### Refresh Token
| Property | Value |
|----------|-------|
| Location | HttpOnly cookie (JS cannot read it) |
| Lifetime | 30 days |
| Contains | subject (email), role, type="refresh" |
| Sent via | Cookie header (automatic) |
| XSS risk | HttpOnly -- invisible to JS |
| Server-side | SHA-256 hash stored in `refresh_tokens` table with `family_id` |
| Revocable | Yes (DB lookup on every refresh) |
| Survives page refresh | Yes (cookie persists) |

### CSRF Token
| Property | Value |
|----------|-------|
| Location | Non-HttpOnly cookie (JS can read it) |
| Sent via | `X-XSRF-TOKEN` header by apiClient |
| Purpose | Prevents cross-site request forgery |
| Required for | POST, PUT, DELETE requests |

## Database: refresh_tokens

```
  ┌────┬──────────────┬─────────┬────────────┬─────────┬───────────┐
  │ id │ token_hash   │ user_id │ family_id  │ revoked │expires_at │
  ├────┼──────────────┼─────────┼────────────┼─────────┼───────────┤
  │  1 │ a3f2...      │       1 │ uuid-aaa   │ TRUE    │ 30 days   │
  │  2 │ b7c1...      │       1 │ uuid-aaa   │ FALSE   │ 30 days   │
  │  3 │ d9e4...      │       2 │ uuid-bbb   │ FALSE   │ 30 days   │
  └────┴──────────────┴─────────┴────────────┴─────────┴───────────┘
         │                         │
         │                         └── Same family = same login session.
         │                             Rotation creates new row,
         │                             revokes old one.
         │
         └── SHA-256 of the raw JWT (never store the actual token)
```

## Design Decisions

- **Access token in memory** -- XSS can't steal it from localStorage
- **Refresh token in HttpOnly cookie** -- XSS can't read it at all
- **Server-side refresh token tracking** -- enables revocation on logout and theft detection
- **Family-based rotation** -- if an old (revoked) token is reused, the entire chain is invalidated, forcing the legitimate user to re-login (safe-side assumption: account may be compromised)
- **401 interceptor with retry queue** -- transparent token refresh, no user-visible interruption
