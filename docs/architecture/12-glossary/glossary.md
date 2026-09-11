# 12. Glossary

<!-- https://docs.arc42.org/section-12/ -->

<!-- arc42 tip: A glossary prevents misunderstandings between technical and non-technical stakeholders.
     Define every term that has a project-specific meaning or could be misread.
     Coordinate with the domain model in section 8 — same names, same meanings.
     Assign a maintainer (e.g. product owner or tech lead) for ongoing updates.
     Avoid trivia — do not define "REST" or "JSON" unless your project redefines them. -->

<!-- tip: Keep definitions to 1–3 sentences. Add "See also" links to related terms and sections.
     In multilingual teams, add a "Translation" column for the project language(s). -->

| Term | Definition | See also |
|---|---|---|
| **Band Event / Journal Entry** | One attended concert: band name, place, date, rating (0–5), comment. Persisted in `band_events`, owned by exactly one AppUser. | Domain Model (§8), `BandEvent.java` |
| **AppUser** | Registered account (email, BCrypt password, name, role `USER`). Persisted in `users`. | Domain Model (§8), `AppUser.java` |
| **Journal** | The SPA page (`/your-journal`) listing all of the signed-in user's entries in a sortable MUI data grid. | Building Block View (§5) |
| **Access Token** | Symmetric-HMAC JWT with 3-minute expiry, subject = user email. Issued as JSON by formLogin and by `/api/refresh-token`; sent as `Authorization: Bearer`. | Auth concepts (§8), ADR-003 |
| **Refresh Token** | JWT with 30-day expiry, same key/claims as access token. Stored in a `refreshToken` cookie and rotated on every refresh. | Auth concepts (§8), ADR-003, Risk R2 (§11) |
| **XSRF-TOKEN** | JavaScript-readable cookie carrying the CSRF token; the SPA copies its value into the `X-XSRF-TOKEN` header on mutating requests (double-submit pattern). | ADR-004 |
| **Hybrid dev mode** | Local Vite dev server (port 3000, HMR) + backend & MySQL in Docker; `/api` is proxied to `:8080`. Started via `./local-dev.sh`. | Deployment View (§7), ADR-007 |
| **DataLoader** | Startup component that seeds 10 dummy BandEvents when the `band_events` table is empty, in every profile. | Runtime View (§6.5) |
| **MusicBrainz lookup** | Browser-side autocomplete of band names against the MusicBrainz API during entry creation; not proxied through the backend. | Context (§3.1) |
| **Flyway migration** | Versioned SQL script `V{N}__{description}.sql` under `backend/src/main/resources/db/migration/`; applied automatically at startup. | ADR-005, Risk R6 |
| **Profiles** | Spring configuration variants: *default* (H2 file DB), *dev* (localhost MySQL, swagger, insecure cookies), *production* (env-driven MySQL, SPA static serving). | Persistence (§8), Deployment (§7) |
| **Path-triggered CI** | GitHub Actions orchestrator that runs only the backend and/or frontend pipelines for the paths that changed. | CI/CD (§7), ADR-001 |
