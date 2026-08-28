# @repo/auth

## Overview

`@repo/auth` is the shared authentication and authorization package for the monorepo. It centralizes Better Auth configuration, database access, session helpers, admin actions, and the Next.js API adapter used by the `auth` app.

## Functionality

- Configures Better Auth with Google and GitHub providers.
- Persists users, sessions, accounts, and verification records in PostgreSQL through Drizzle ORM.
- Adds approval state, role, and application scopes to the session.
- Exposes access checks for Next.js (`validateAccess`, `validateAccessProxy`) and Vite/Vercel middleware (`validateAccessMiddleware`).
- Redirects unauthenticated, unapproved, or unauthorized users to the auth app.
- Provides admin-only actions to list users, approve users, and update roles and scopes.

## Architecture and Structure

- `server.ts` defines Better Auth configuration.
- `client.ts` creates the React auth client and exposes `useAuth`.
- `helpers.ts` contains session retrieval and access guards.
- `api.ts` adapts Better Auth to Next.js `GET` and `POST` handlers.
- `actions.ts` contains admin user-management actions.
- `schema.ts` defines the Drizzle PostgreSQL tables.
- `drizzle.ts` creates the Neon HTTP database client.
- `drizzle.config.ts` configures schema generation and migrations in `drizzle/`.

## Dependencies and Configuration

Important dependencies are Better Auth, Drizzle ORM, `@neondatabase/serverless`, Next.js server utilities, and `@repo/utils`. Configure `MARCEL_PROJECTS_DATABASE_URL`, `MARCEL_PROJECTS_AUTH_SECRET`, `MARCEL_PROJECTS_GOOGLE_CLIENT_ID`, `MARCEL_PROJECTS_GOOGLE_CLIENT_SECRET`, `MARCEL_PROJECTS_GITHUB_CLIENT_ID`, and `MARCEL_PROJECTS_GITHUB_CLIENT_SECRET`. The package uses the shared domain and auth URL from `@repo/utils` for cookies, redirects, and trusted origins.

## Development and Usage

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm db:generate
pnpm db:migrate
```

The package is consumed through workspace imports:

```ts
import { validateAccess } from "@repo/auth";
import { authClient } from "@repo/auth/client";
```

A reachable PostgreSQL database is required for migrations.

## Build and Deployment

No build, test, lint, or format scripts are declared. The package is compiled and consumed through importing workspaces; run a dependent app build after changing shared code.

## Additional Notes

Access checks bypass Vercel-only enforcement when `VERCEL` is unset for local development. Administrators bypass scope checks; ordinary users must be approved and granted the requested scope.
