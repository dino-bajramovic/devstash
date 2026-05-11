## Current feature

Dashboard UI Phase 1 — Foundation & Layout Shell

## Status

Completed

## Goals

- Initialize ShadCN UI and install required components
- Create dashboard route at `/dashboard`
- Set up main dashboard layout with global styles
- Dark mode by default
- Top bar with search input and "New Item" button (display only)
- Placeholder sidebar and main area (h2 headings only)

## Notes

- Reference screenshot: `context/screenshots/dashboard-ui-main.png`
- Mock data available at `src/lib/mock-data.ts` for later phases
- Phase 2 and Phase 3 specs exist in `context/features/`

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