# Music

## Overview

Music is a Next.js music library and player application. It stores song metadata and playlists in PostgreSQL, stores audio files in Vercel Blob, and uses `@repo/auth` for production access control.

## Functionality

- Browses a song library with search, genres, ordering, and English/German UI.
- Plays audio with mini and full player views, playback speed, looping, and visualization controls.
- Manages playlists and favorites, including adding, removing, renaming, and deleting playlists.
- Lets administrators upload, trim, preview, edit, and delete audio files.
- Provides library, genre, playlist, and settings routes.
- Installs as a PWA through `public/site.webmanifest` and `public/icons`.

Song and playlist mutations plus uploads are admin-only. `src/proxy.ts` protects the app with the `music` scope in production.

## Architecture and Structure

- `src/app/` contains App Router pages and the `/api/upload` route.
- `src/actions/` contains server actions for songs, playlists, genres, and ordering; cache tags are updated after mutations.
- `src/components/player/`, `song/`, `playlist/`, and `upload/` contain the main workflows.
- `src/store/` contains Zustand stores for favorites and player state.
- `src/lib/prisma.ts` and `prisma/schema.prisma` define the Prisma connection and data model.
- `src/proxy.ts` calls `validateAccessProxy` with the `music` scope.

The Prisma model includes `Song`, `Playlist`, and ordered join tables for playlist and genre membership. Audio URLs combine the Blob storage URL with each song's stored path.

## Dependencies and Configuration

Important dependencies include Next.js/React, Prisma with `@prisma/adapter-neon`, `@vercel/blob`, `@ffmpeg/ffmpeg`, Zustand, and `@repo/auth`. Configure `MARCEL_PROJECTS_DATABASE_URL` for PostgreSQL and `BLOB_READ_WRITE_TOKEN` for Vercel Blob uploads. The storage URL is defined in `src/lib/constants.ts`; never commit credentials.

## Development

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm db:generate
pnpm dev
pnpm build
pnpm start
pnpm lint
```

`pnpm build` generates Prisma first and then runs `next build`. A reachable PostgreSQL database is required for database-backed development.

## Build and Deployment

Deploy as a Next.js application. The production environment needs the database and Blob settings and must share the auth-domain configuration used by `@repo/auth`. `next.config.ts` configures the Content Security Policy for the Blob host and FFmpeg assets loaded from `unpkg.com`.

## Testing and Linting

No automated test script is defined. Use `pnpm lint`, `pnpm db:generate`, and `pnpm build` for the available checks.

## Additional Notes

The upload route accepts MPEG, MP3, WAV, OGG, and WebM audio, allows overwrite, and sets a six-month cache lifetime. Song speed is constrained to `0.50` through `1.50` with at most two decimal places. Review Prisma schema changes and cache tags when changing library data behavior.
