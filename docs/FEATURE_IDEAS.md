# Feature Ideas

## 1. CSV Export
**Effort:** Small (30 min) | **Impact:** High for personal data ownership

Add an "Export CSV" button to the journal page that downloads all concert entries as a CSV file (band, place, date, rating, comment). Client-side generation from already-loaded data -- no backend changes needed.

- Button placement: next to sort controls on both mobile and desktop journal views
- Filename: `concert-journal-YYYY-MM-DD.csv`
- Handle CSV escaping for commas/quotes in band names and comments
- New file: `utils/exportCsv.ts`
- Modified: `Journal.tsx`

## 2. Year in Review
**Effort:** Medium (2-3 hrs) | **Impact:** High engagement

Auto-generated summary page for a selected year. Shows:
- Total concerts attended that year
- Top 5 most-seen artists
- Top 5 most-visited venues
- Highest and lowest rated concerts
- Average rating
- First and last concert of the year
- Concerts per month bar chart (simple, using MUI or a lightweight chart lib)

Implementation:
- New route `/year-in-review` (or `/year-in-review/:year`)
- Year selector dropdown (populated from available data)
- All computation client-side from existing event data (no backend changes)
- Extend `calculateStatistics.ts` or create a new `calculateYearInReview.ts`
- Consider a shareable/printable layout

## 3. Concert Timeline / Calendar Heatmap
**Effort:** Medium (2-4 hrs) | **Impact:** High visual appeal

A visual representation of concert attendance over time. Two possible views:

**Option A: GitHub-style heatmap**
- Grid of squares, one per day, colored by number of concerts (0 = empty, 1 = light, 2+ = dark)
- Scrollable by year
- Libraries: `react-calendar-heatmap` or custom SVG grid

**Option B: Vertical timeline**
- Chronological list with year markers and connecting lines
- Each entry shows band name, venue, date, rating
- Could reuse the existing mobile card layout

Either option would live on the landing page or as a new `/timeline` route. Data is already available from `useEvents`.

## 4. Quick Filters on Journal
**Effort:** Small-Medium (1-2 hrs) | **Impact:** Medium

Add filter chips/dropdowns above the journal table:
- **By year:** Dropdown or chip group with available years
- **By minimum rating:** Slider or chip group (3+, 4+, 5 only)
- **By venue:** Dropdown with all unique venues
- **By artist:** Dropdown with all unique artists

These would work alongside the existing text search on the landing page. The journal currently only has sort -- adding filters would make it much more useful for users with large collections.

Implementation:
- Add filter state to `Journal.tsx`
- Filter the data before passing to `DataCollector`/`DataTable`
- Persist selected filters to `localStorage` (like sort already does)
- No backend changes -- all client-side filtering

## 5. Unsaved Changes Warning
**Effort:** Small (30 min) | **Impact:** Medium (prevents data loss)

When a user is filling out the new entry or edit entry form and tries to navigate away (browser back, clicking a nav link, closing the tab), show a confirmation dialog.

Implementation:
- Use `react-router-dom`'s `useBlocker` (v6.4+) or `beforeunload` event
- Add a `isDirty` state to `EntryForm` that tracks if any field has been modified
- Show MUI `Dialog` on navigation attempt when dirty
- No backend changes

## 6. Share a Concert Entry
**Effort:** Medium (2-3 hrs) | **Impact:** Medium (social/fun)

Generate a shareable card image or formatted text for a single concert entry.

**Option A: Copy-to-clipboard formatted text**
- Button on each entry: "Share"
- Copies something like: "Saw Radiohead at Wembley Stadium on 2024-06-15. Rated 5/5."
- Simplest to implement, works everywhere

**Option B: Generate a card image**
- Use `html2canvas` or a canvas API to render a styled card
- User can download or share the image
- More visually appealing but heavier implementation

**Option C: Public share link**
- Backend: new endpoint `GET /api/event/{id}/share` that generates a short-lived public token
- Frontend: renders a public page at `/shared/{token}` (no auth required)
- Most complex, requires backend changes + new route + token management

Recommendation: Start with Option A (copy-to-clipboard), upgrade to B or C later if there's interest.

## 7. Enhanced Statistics Dashboard
**Effort:** Medium (2-3 hrs) | **Impact:** Medium

Expand the current 4-card stats on the landing page into a richer dashboard:
- **Concerts per year** bar chart
- **Rating distribution** (how many 1-star, 2-star, etc.)
- **Top 10 artists** ranked list with concert count
- **Top 10 venues** ranked list
- **Concert frequency** trend (are you going to more or fewer concerts over time?)
- **Streak tracker** (longest streak of consecutive weeks/months with concerts)

Current stats (`calculateStatistics.ts`) compute: total count, most-seen artist, most artists on a single day, most visited location. This would extend that significantly.

For charts, consider a lightweight library like `recharts` (React-native, ~40kb) or just use MUI's built-in linear progress bars for simple visualizations without adding a dependency.
