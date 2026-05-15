## Current feature

Seed Data — populate the database with sample data for development and demos

## Status

In Progress

## Goals

- Override the existing `prisma/seed.ts` with full sample data per the seed spec
- Create a demo user (`demo@devstash.io`) with a hashed password
- Seed all 7 system `ItemType` records (snippet, prompt, command, note, file, image, link)
- Create 5 collections with realistic items: React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources
- All items should have appropriate tags, content, and metadata

## Specs

@features/seed-spec.md

## Notes

- NextAuth v5 is still in beta — use `next-auth@beta`
- Never use `prisma db push` — always migrations
- Keep all features unlocked during dev (isPro gating infrastructure only)
- Hash demo user password with `bcryptjs`, 12 rounds
- Use real URLs for link items (DevOps and Design Resources collections)
- The seed script must be fully idempotent — safe to run multiple times (upsert or delete-then-recreate)
- Override whatever is currently in `prisma/seed.ts` completely

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