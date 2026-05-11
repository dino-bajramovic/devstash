## Current feature

Dashboard UI Phase 3 — Main Area

## Status

In Progress

## Goals

- 4 stats cards at the top (total items, collections, favorite items, favorite collections)
- Recent collections section
- Pinned items section
- 10 recent items section

## Notes

- Reference screenshot: `context/screenshots/dashboard-ui-main.png`
- Use mock data from `src/lib/mock-data.ts` (no database yet)
- Stats cards are NOT in the screenshot — add them at the top of the main area

## History

<!-- Keep this updated. Ealiest to latest -->

### 2026-05-11 — Initial Next.js & Tailwind Setup

- Scaffolded Next.js 16 project with TypeScript and Tailwind CSS v4
- Added project context files (`context/`)
- Removed default Next.js placeholder assets
- Committed and pushed to `https://github.com/dino-bajramovic/devstash.git`

### 2026-05-11 — Dashboard UI Phase 1

- Initialized ShadCN UI (Radix base, Tailwind v4 compatible)
- Installed ShadCN `button` and `input` components
- Created dashboard route at `/dashboard` with nested layout
- Top bar with DevStash logo, search input, "New Collection" and "+ New Item" buttons (display only)
- Placeholder sidebar (`h2 "Sidebar"`) and main area (`h2 "Main"`)
- Dark mode by default via `dark` class on `<html>`
- Switched font from Geist to Inter + JetBrains Mono to match design screenshots

### 2026-05-11 — Dashboard UI Phase 2 — Sidebar

- Collapsible sidebar (desktop: icon-only mode ↔ full width via `PanelLeft` toggle in sidebar header)
- Mobile: always a slide-in overlay drawer with backdrop
- "Navigation" header row with label left, toggle button right
- Types section (collapsible) — all 7 item types with colored icons, counts, links to `/items/{slug}`
- Collections section (collapsible) — FAVORITES subsection (amber star + X on hover) and ALL COLLECTIONS subsection
- User avatar at the bottom with initials, name, email, and settings icon
- Search input centered in the top bar; logo left, action buttons right
- Extracted `DashboardShell` client component for state management; layout.tsx stays a server component