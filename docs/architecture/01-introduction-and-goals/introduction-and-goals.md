# 1. Introduction and Goals

<!-- https://docs.arc42.org/section-1/ -->

<!-- arc42 tip: This section answers "what does the system do and for whom?"
     Keep it concise — stakeholders read this first.
     Functional requirements belong here only as a brief summary; link to your backlog or spec for the full list. -->

Concert Journal is a single-product web application for private users who want to keep a
personal journal of the concerts they have attended. After registering, a user records
concert visits (band, place, date, rating, comment), browses them in a sortable/searchable
journal table, and edits or deletes entries. Band information can be looked up from the
MusicBrainz metadata service to ease data entry.

## 1.1 Requirements Overview

<!-- tip: List the top 5–10 functional requirements or driving forces.
     Use a numbered list or a table — not long paragraphs.
     Link to the full requirement document / backlog item rather than copying it verbatim.
     An activity diagram or BPMN sketch works well for complex workflows. -->

| # | Requirement | Priority |
|---|---|---|
| R1 | Register with email + password (BCrypt-hashed, role `USER` assigned by server) | High |
| R2 | Sign in / sign out; session kept alive via silent token refresh | High |
| R3 | Create a journal entry: band name, place, date, rating (0–5), comment | High |
| R4 | Browse all own entries in a journal table with sorting, filtering and swipe-to-delete | High |
| R5 | Edit an existing entry | High |
| R6 | Every user sees only their own entries (per-user data isolation) | High |
| R7 | Band lookup via MusicBrainz API while filling in the entry form | Medium |
| R8 | Light/dark theme toggle | Low |
| R9 | Public landing page; journal area only for authenticated users | Medium |

## 1.2 Quality Goals

<!-- tip: Pick the 3–5 quality attributes (ISO 25010) that most constrain the architecture.
     Be specific and measurable — "P95 response time < 200 ms" beats "fast".
     These feed directly into section 4 (Solution Strategy) and section 10 (Quality Scenarios).
     Limit this table to top priorities; full scenarios go in section 10. -->

| Priority | Quality Goal | Motivating scenario (brief) |
|---|---|---|
| 1 | Security | User data (passwords, personal journal) must never leak; OWASP baseline (CSRF, security headers, rate limiting) is in place |
| 2 | Operability | Single-container production deployment on self-hosted infra; health/metrics endpoints exposed |
| 3 | Maintainability | Solo hobby project — CI-gated lint/test/build and a test suite on both sides keep regressions out |
| 4 | Usability (developer) | Fast feedback loop: hybrid dev mode with Vite HMR locally, backend in Docker |
| 5 | Portability | Multi-arch Docker images (amd64/arm64); runs on MySQL and H2 |

## 1.3 Stakeholders

<!-- tip: List everyone who reads, influences, or is affected by the architecture.
     Include those who will work with the code, not just decision-makers.
     Document their specific expectation — missing stakeholders cause missing requirements.
     Classify by interest and influence if useful (power/interest grid). -->

| Role | Name / Team | Expectation |
|---|---|---|
| Owner / Sole Developer | S. Wieland | Full-stack hobby product, self-hosted at `concertjournal.de`; architecture serves learning and personal use |
| End Users | Registered visitors of `concertjournal.de` | Reliable, private journal; simple auth |
| Operations | Owner (Synology NAS hosting, reverse proxy, Docker) | Single service to run; Prometheus metrics for monitoring |
| CI / Tooling | GitHub Actions | Path-based builds; images published to private registry |
