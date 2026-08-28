# Marcel Projects

## Overview

Marcel Projects is a pnpm/Turborepo monorepo containing several small web applications and the shared packages they use. The applications include authentication, administration, music playback, a JWT parser, a pi memory game, and a simple project index page.

## Repository Structure

### Applications

- [`apps/admin`](apps/admin/README.md) is the protected user and application-access administration dashboard.
- [`apps/auth`](apps/auth/README.md) provides the shared sign-in, account, and Better Auth API experience.
- [`apps/jwt`](apps/jwt/README.md) is a client-side JWT decoder and viewer.
- [`apps/memory-pi-game`](apps/memory-pi-game/README.md) is a browser game for memorizing digits of pi.
- [`apps/music`](apps/music/README.md) is a music library, player, playlist manager, and audio upload application.
- [`apps/www`](apps/www/README.md) is the static project index page.

### Shared Packages

- [`packages/auth`](packages/auth/README.md) contains Better Auth configuration, Drizzle database access, session helpers, access guards, and user-management actions.
- [`packages/utils`](packages/utils/README.md) exports shared deployment, authentication, and application-scope constants.

Each app and package has its own README with workspace-specific architecture, configuration, usage, and validation details.

## Prerequisites

- Node.js with pnpm `11.10.0` as specified by the root `package.json`.
- A PostgreSQL/Neon database when working with `@repo/auth` or the Music app.
- The relevant OAuth, authentication, database, and Vercel Blob environment variables for the app being run. Do not commit secret values.

## Installation

Run this from the repository root:

```bash
pnpm install
```

The workspace is defined by `pnpm-workspace.yaml`; it automatically includes every directory under `apps/` and `packages/`.

## Development

The root development command delegates to all workspaces that define a `dev` script:

```bash
pnpm dev
```

To work on one workspace, change into its directory and run its documented script. For example:

```bash
cd apps/music
pnpm dev
```

The individual workspace READMEs list their actual scripts and local prerequisites.

## Build

Build all workspaces through Turborepo with:

```bash
pnpm build
```

The `build` task builds dependencies first, caches successful results, and recognizes both `dist` and `.next` output directories. Its cache is invalidated by the environment variables declared in `turbo.json`.

To build one workspace, run its own `pnpm build` script from that workspace directory when one exists.

## Configuration

The root does not load environment variables itself. Environment variables are consumed by the workspaces that need them, including the shared authentication package and Music. `turbo.json` declares the authentication, database, and Blob-related variables used when calculating build cache inputs:

- `MARCEL_PROJECTS_AUTH_SECRET`
- `MARCEL_PROJECTS_DATABASE_URL`
- `MARCEL_PROJECTS_GOOGLE_CLIENT_ID`
- `MARCEL_PROJECTS_GOOGLE_CLIENT_SECRET`
- `MARCEL_PROJECTS_GITHUB_CLIENT_ID`
- `MARCEL_PROJECTS_GITHUB_CLIENT_SECRET`
- `DATABASE_URL`
- `BLOB_STORAGE_URL`
- `BLOB_READ_WRITE_TOKEN`

Consult the relevant workspace README before configuring any variable; not every app requires every variable.

## Turborepo Configuration

`turbo.json` defines two root-level task types:

- `dev` is persistent and is not cached.
- `build` depends on upstream workspace builds and caches `dist/**` and `.next/**` outputs.

The root `package.json` is private and contains Turborepo as its development dependency. Workspace-specific dependencies and scripts remain in each app or package directory.

## Testing and Linting

The root package does not define test, lint, type-check, or format scripts. Validation is workspace-specific; use the commands documented in the relevant README. Currently, the Next.js apps expose lint scripts, while the Vite apps expose build and preview scripts.

## Deployment

The individual applications are deployed independently. The Vite applications include Vercel configuration for static `dist` output, while the Next.js applications use their own Next.js build configuration. See each application README for deployment requirements and environment variables.

## Additional Notes

Use the shared package READMEs as the source of truth when changing authentication behavior or shared scope/domain constants. Changes to `packages/auth` or `packages/utils` can affect multiple applications and should be checked with the dependent app builds.
