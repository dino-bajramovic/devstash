# Database Spec — Neon Postgres + Prisma 7

## Provider

- **Neon** (cloud Postgres, AWS Europe Central 1 — Frankfurt)
- Connection via `DATABASE_URL` environment variable
- SSL required (`?sslmode=require`)

## ORM

- **Prisma 7** (latest)
- Config file: `prisma.config.ts` (Prisma 7 style — datasource URL lives here, not in schema)
- Schema file: `prisma/schema.prisma`
- Generated client output: `src/generated/prisma`
- Migrations path: `prisma/migrations`

## Rules

- **Never** use `prisma db push` — always use `prisma migrate dev` (dev) and `prisma migrate deploy` (prod)
- Run `prisma migrate status` before committing to verify migrations are in sync
- Production deployments must run `prisma migrate deploy` before the app starts

## Schema Overview

### Enums

```prisma
enum ContentType {
  TEXT
  FILE
  URL
}
```

### Models

| Model | Description |
|-------|-------------|
| `User` | App user (email/password or OAuth). Owns items, collections, tags, custom types. |
| `Account` | NextAuth OAuth accounts linked to a User |
| `Session` | NextAuth sessions |
| `VerificationToken` | NextAuth email verification |
| `ItemType` | Defines item categories (system + custom). 7 system types seeded on migration. |
| `Item` | Core unit — snippet, prompt, command, note, link, file, or image |
| `Collection` | Groups of items. Items can belong to multiple collections. |
| `ItemCollection` | Join table: Item ↔ Collection (many-to-many) |
| `Tag` | User-scoped tags |
| `ItemTag` | Join table: Item ↔ Tag (many-to-many) |

### System ItemTypes (seeded)

| Name | Icon | Color | Storage | Tier |
|------|------|-------|---------|------|
| Snippet | `Code` | `#3b82f6` | TEXT | Free |
| Prompt | `Sparkles` | `#8b5cf6` | TEXT | Free |
| Command | `Terminal` | `#f97316` | TEXT | Free |
| Note | `StickyNote` | `#fde047` | TEXT | Free |
| Link | `Link` | `#10b981` | URL | Free |
| File | `File` | `#6b7280` | FILE | Pro |
| Image | `Image` | `#ec4899` | FILE | Pro |

## Key Design Decisions

- `ItemType.userId` is nullable — `null` means it's a system type
- `Item.contentType` (enum) determines which content field is populated
- `Collection.defaultTypeId` sets the default item type for new items created inside that collection
- `ItemCollection.addedAt` tracks when an item was added to a collection
- All user-owned data cascades on user delete
