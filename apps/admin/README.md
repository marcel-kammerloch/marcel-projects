# Admin

## Overview

The admin app is a protected Next.js dashboard for managing Marcel Projects users. It uses `@repo/auth` for authentication and authorization and manages access to the other applications.

## Functionality

- Lists users with approval state, role, and application scopes.
- Approves pending users.
- Changes approved users between `user` and `admin` roles.
- Grants or removes the scopes defined by `@repo/utils`: `jwt`, `memory-pi-game`, and `music`.

`src/proxy.ts` protects requests with the admin guard. The dashboard page and its client-side rows call server actions from `@repo/auth/actions`.

## Architecture and Structure

- `src/app/page.tsx` renders the protected dashboard.
- `src/app/user-row.tsx` provides approval and edit controls.
- `src/proxy.ts` applies admin authorization to application routes.
- `src/components/ui/` contains local table, dialog, select, card, and button primitives.
- `next.config.ts` adds `X-Robots-Tag: noindex, nofollow` and disables the powered-by header.

## Dependencies and Configuration

The app depends on `@repo/auth` for sessions and user actions and `@repo/utils` for the canonical scope list. The shared auth package requires `MARCEL_PROJECTS_DATABASE_URL`, `MARCEL_PROJECTS_AUTH_SECRET`, `MARCEL_PROJECTS_GOOGLE_CLIENT_ID`, `MARCEL_PROJECTS_GOOGLE_CLIENT_SECRET`, `MARCEL_PROJECTS_GITHUB_CLIENT_ID`, and `MARCEL_PROJECTS_GITHUB_CLIENT_SECRET` in the deployment environment. Never commit their values.

## Development

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

The development server normally runs at `http://localhost:3000`.

## Build and Deployment

`pnpm build` runs `next build`, and `pnpm start` serves the production build. This is a Next.js deployment; production routes should remain protected by the shared auth service.

## Testing and Linting

No test runner or formatter is configured. `pnpm lint` and `pnpm build` are the available validation commands.

## Additional Notes

An unapproved user cannot have their role changed. The shared access helpers bypass Vercel-only checks when `VERCEL` is unset, which supports local development; production authorization should be tested with the deployment environment enabled.
