# 6. Runtime View

<!-- https://docs.arc42.org/section-6/ -->

<!-- arc42 tip: Pick 3–5 architecturally significant scenarios — not every flow.
     Focus on: the core happy path, critical failure paths, startup/shutdown, and interactions
     that would surprise a reader who only knows the static structure from section 5.
     Every building block in a diagram here must exist in section 5. -->

## 6.1 Sign In (core happy path)

<!-- tip: Replace this with the single most important runtime flow in your system.
     Use a sequence diagram for request/response patterns.
     Show auth, validation, persistence, and external calls in a single diagram when they all occur. -->

```mermaid
sequenceDiagram
    actor User
    participant SPA as React SPA (SignInSide)
    participant Auth as AuthContext
    participant API as Spring Security (formLogin)
    participant DB as MySQL

    User->>SPA: enter email + password
    SPA->>API: POST /login (form credentials, withCredentials)
    API->>API: CustomUserDetailsService loads user
    API->>API: BCrypt password check
    API->>DB: load AppUser
    API-->>SPA: 200 { accessToken, refreshToken }
    API-->>SPA: Set-Cookie: refreshToken (30 days)
    Auth->>Auth: store accessToken in state, isLoggedIn = true
    Auth->>Auth: start 2-minute refresh interval
    SPA->>User: redirect to journal
```

## 6.2 Silent Token Refresh (background flow)

The frontend proactively refreshes the 3-minute access token **every 2 minutes**, on every
app start, and skips refreshing on the sign-in/sign-up pages (`AuthContext.tsx:124-183`).

```mermaid
sequenceDiagram
    participant Timer as AuthContext (setInterval, 2 min)
    participant API as SecurityController (/api/refresh-token)
    participant Jwt as JwtUtils

    Timer->>API: POST /api/refresh-token (X-XSRF-TOKEN header, refreshToken cookie)
    API->>API: read refreshToken cookie
    API->>Jwt: parseToken (verify HMAC signature)
    alt valid refresh token
        Jwt-->>API: claims (subject = email)
        API->>Jwt: generateToken (3 min) + generateRefreshToken (30 days)
        API-->>Timer: 200 { accessToken } + rotated refreshToken cookie
        Timer->>Timer: setAccessToken(token), isLoggedIn = true
    else invalid / missing
        API-->>Timer: 400
        Timer->>Timer: setLoggedOut() — stop interval, clear tokens
    end
```

## 6.3 Create a Journal Entry (CSRF + JWT + ownership)

```mermaid
sequenceDiagram
    actor User
    participant SPA as EntryForm
    participant API as BandEventController (POST /api/event)
    participant Svc as BandEventService
    participant DB as MySQL

    User->>SPA: fill band, place, date, rating
    SPA->>API: POST /api/event (Bearer accessToken, X-XSRF-TOKEN header, JSON payload)
    API->>API: SecurityFilterChain: rate limit → JWT → CSRF (double submit) → authenticated?
    API->>Svc: saveEvent(bandEvent) — @Valid bean validation
    Svc->>DB: findByEmail(authenticated email)
    Svc->>Svc: bandEvent.setAppUser(owner)
    Svc->>DB: save(bandEvent)
    DB-->>API: persisted entity (incl. appUser relation)
    API-->>SPA: 200 BandEvent JSON
    Note over API,SPA: See §11 R1: response currently serialises the owner's AppUser
```

## 6.4 Error — Rate Limit Exceeded

```mermaid
sequenceDiagram
    actor Client
    participant RL as RateLimitFilter
    participant Chain as Filter Chain

    Client->>RL: request (> 60/min from this IP)
    RL->>RL: RateLimiter denies permission
    RL-->>Client: 429 "Too many requests. Please try again later."
    Note over Chain: downstream chain not invoked
```

## 6.5 Startup — Migrations and Test Data

```mermaid
sequenceDiagram
    participant Boot as Spring Boot startup
    participant Fly as Flyway
    participant DL as DataLoader
    participant DB as MySQL

    Boot->>Fly: migrate (classpath:db/migration, validate-on-migrate)
    Fly->>DB: V1 users, V2 band_events (if pending)
    Boot->>DL: ApplicationReadyEvent
    DL->>DB: count band events
    alt database empty
        DL->>DB: insert 10 dummy events
    else events exist
        DL->>DB: skip seeding
    end
```
