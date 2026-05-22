## Current Feature

## Status

## Goals

## Notes

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

### 2026-05-12 — Dashboard UI Phase 3 — Main Area

- 4 stats cards at the top (total items, collections, favorite items, favorite collections)
- Collections grid with type icons, favorite star, and hover-reveal more button
- Pinned items section with colored type icon circles, tags, and dates
- Recent items section (up to 10, sorted by date desc)
- All pages SSR by default; only interactive leaves (`CollectionMoreButton`) use `'use client'`

### 2026-05-15 — Foundation — Prisma + Neon + NextAuth v5

- Installed Prisma 7 with `@prisma/adapter-pg` and connected to Neon PostgreSQL
- Defined full schema: User, Account, Session, VerificationToken, Item, ItemType, Collection, ItemCollection, Tag, ItemTag
- Created and applied initial migration via `prisma migrate dev`
- Seeded 7 system ItemTypes (Snippet, Prompt, Command, Note, Link, File, Image)
- Installed NextAuth v5 (`next-auth@beta`) with Prisma adapter
- Email/password + GitHub OAuth providers configured
- `/dashboard` route protected via middleware (`auth()` from NextAuth)
- Prisma client configured with `prisma.config.ts` and singleton in `src/lib/prisma.ts`

### 2026-05-15 — Seed Data

- Demo user `demo@devstash.io` with bcrypt-hashed password (12 rounds)
- 7 system ItemTypes upserted (snippet, prompt, command, note, file, image, link)
- 5 collections with 14 items total: React Patterns (3 snippets), AI Workflows (3 prompts), DevOps (1 snippet, 1 command, 2 links), Terminal Commands (4 commands), Design Resources (4 links)
- All items tagged; real URLs used for link items
- Script is fully idempotent — safe to re-run via `npm run db:seed`

### 2026-05-15 — Dashboard Collections — Real Data

- Created `src/lib/db/collections.ts` with `getCollectionsForDashboard` and `getDashboardStats`
- Collections fetched from Neon DB via Prisma with nested item→itemType includes
- Dominant type computed per collection (most-used itemType by count)
- Collection card border color derived from dominant type color
- Type icons in card footer rendered from distinct types present in that collection
- All 4 stats cards (total items, collections, favorites) now pull from DB
- Dev fallback: if no auth session, load data for `demo@devstash.io`
- `AUTH_SECRET` generated and set in `.env`

### 2026-05-15 — Dashboard Items — Real Data

- Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems`
- Items fetched from Neon DB via Prisma with nested itemType and tags includes
- `ItemCard` updated to accept real `itemType` object directly (removed mock data dependency)
- Pinned section hidden when no pinned items exist
- Recent items section hidden when no items exist
- Fixed SSL warning in `prisma.ts` and `seed.ts` (`sslmode=require` → `sslmode=verify-full`)

### 2026-05-18 — Dashboard Stats & Sidebar — Real Data

- Added `getSidebarData` to `src/lib/db/collections.ts` — fetches system item types with per-user counts and all collections with dominant type color
- Dashboard layout (`layout.tsx`) now fetches sidebar data server-side and passes it down via props
- `DashboardShell` updated to accept and forward `sidebarData` prop to `Sidebar`
- `Sidebar` replaced all mock data with real DB data: item types with counts linking to `/items/[slug]`, favorite collections with star icons, recent (non-favorite) collections with colored dot based on dominant item type
- Added "View all collections" link at the bottom of the collections section pointing to `/collections`
- Item types ordered: Snippet → Prompt → Command → Note → File → Image → Link

### 2026-05-20 — Add PRO Badge to Sidebar

- Installed shadcn `Badge` component (`src/components/ui/badge.tsx`)
- Added a subtle amber PRO badge next to the File and Image item types in the sidebar types list
- Badge is hidden in collapsed sidebar mode; only visible in full-width mode

### 2026-05-21 — Code Audit Quick Wins

- Replaced hardcoded personal email in `src/lib/mock-data.ts` with `demo@devstash.io` placeholder
- Extracted duplicate demo-user fallback into `getUserIdOrDemo()` in `src/lib/auth.ts`
- `dashboard/page.tsx` and `dashboard/layout.tsx` now use the shared helper

### 2026-05-22 — Auth Setup — NextAuth + GitHub Provider

- Created `src/auth.config.ts` — edge-safe config with GitHub provider and JWT/session callbacks
- Created `src/auth.ts` — full config with PrismaAdapter, Credentials provider (bcrypt), and split config spread
- Created `src/proxy.ts` — Next.js 16 proxy protecting `/dashboard/*`, redirects unauthenticated users to `/api/auth/signin`
- Created `src/types/next-auth.d.ts` — extends `Session` and `JWT` types with `id` and `isPro` fields
- Updated `src/app/api/auth/[...nextauth]/route.ts` to import handlers from `@/auth`
- Simplified `src/lib/auth.ts` to only export `getUserIdOrDemo()`, importing `auth` from `@/auth`
- Verified: GitHub OAuth login works end-to-end, `/dashboard` redirects unauthenticated users
