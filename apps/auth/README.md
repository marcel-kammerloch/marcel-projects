# Auth

## Overview

Auth is the central Next.js authentication application for Marcel Projects. It provides the sign-in UI, account status pages, access links, and the Better Auth API consumed by the other apps.

## Functionality

- Signs users in with Google or GitHub.
- Returns users to a requested application when the `redirect` query value is a known scope.
- Shows whether an account is awaiting approval or approved, including role and granted scopes.
- Provides account sign-out and an access-denied state.
- Exposes `GET` and `POST` handlers under `/api/auth/[...all]` through `@repo/auth/api`.

## Architecture and Structure

- `src/app/(main)/page.tsx` renders the provider sign-in screen.
- `src/app/account/page.tsx` renders the authenticated account view.
- `src/app/denied/page.tsx` renders the missing-scope state.
- `src/app/api/auth/[...all]/route.ts` forwards Better Auth route handlers.
- `src/components/` contains the access grid, status card, sign-out control, and alert UI.
- `src/proxy.ts` validates allowed origins for auth API requests.
- `next.config.ts` and `postcss.config.mjs` configure the Next.js and Tailwind build.

## Dependencies and Configuration

The app uses `@repo/auth` for the Better Auth server/client and `@repo/utils` for shared domain and scope constants. Configure `MARCEL_PROJECTS_DATABASE_URL`, `MARCEL_PROJECTS_AUTH_SECRET`, `MARCEL_PROJECTS_GOOGLE_CLIENT_ID`, `MARCEL_PROJECTS_GOOGLE_CLIENT_SECRET`, `MARCEL_PROJECTS_GITHUB_CLIENT_ID`, and `MARCEL_PROJECTS_GITHUB_CLIENT_SECRET`. Provider callback URLs must match the deployed auth app. Keep credentials out of source control.

## Development

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

`pnpm dev` uses Next.js with Turbopack and normally serves `http://localhost:3000`.

## Build and Deployment

`pnpm build` runs `next build`; `pnpm start` serves the production build. The app is designed for the Vercel-hosted auth domain from `@repo/utils`, and shared cookies are configured for the monorepo subdomains.

## Testing and Linting

No test runner or formatter is configured. `pnpm lint` and `pnpm build` are the available validation commands.

## Additional Notes

New accounts remain unapproved until an administrator approves them in the admin app. The account view links only to scopes returned by the authenticated session; administrators can access every application through the shared authorization helpers.
