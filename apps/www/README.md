# Marcel Projects

## Overview

This is the static Vite landing page for Marcel Projects. It provides links to the deployed Memory Pi Game, Music PWA, and JWT Parser applications.

## Functionality

The page renders the project title and three external links: Memory Pi Game, Music PWA, and JWT Parser. It contains no application logic, API routes, authentication flow, or server-side data access.

## Architecture and Structure

- `public/index.html` contains the complete markup and inline styles.
- `vite.config.js` sets `public` as the Vite root and writes output to `dist`.
- `vercel.json` runs `pnpm build` and serves `dist`.

## Dependencies and Configuration

The only declared dependency is the Vite development tool. No environment variables are read by the page.

## Development

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm dev
pnpm build
pnpm preview
```

## Build and Deployment

`pnpm build` runs `vite build` and generates static output in `dist`. Vercel is the configured deployment platform.

## Testing and Linting

No automated tests, type checking, linting, or formatting scripts are defined. Use `pnpm build` and `pnpm preview` to validate the static page.

## Additional Notes

Destination URLs are hard-coded in `public/index.html`; update them there when a deployed app hostname changes.
