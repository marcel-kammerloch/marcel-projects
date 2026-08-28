# Memory Pi Game

## Overview

Memory Pi Game is a browser game for memorizing and typing digits of pi. It is a standalone Vite app exposed as the `memory-pi-game` application scope.

## Functionality

- Challenges players to type successive pi digits under a per-digit timeout.
- Tracks current digit count and elapsed time.
- Stores best digit count and best time in browser `localStorage`.
- Provides practice mode with configurable starting digit and displayed digit count.
- Provides options for timeout length and digit grouping.
- Supports restarting with Enter and registers a service worker on HTTPS.

## Architecture and Structure

- `src/index.html` defines game, practice, options, score, and feedback areas.
- `src/script.js` contains state, timing, input handling, settings, and score persistence.
- `src/style.css` contains presentation styles.
- `public/sw.js` and `public/site.webmanifest` provide the PWA pieces.
- `vite.config.js` uses `src` as root, `public` as the public directory, and outputs to `dist`.
- `vercel.json` configures the Vercel build and static output directory.

## Dependencies and Configuration

The package declares `@repo/auth`, but the game implementation is client-side and does not make an authentication request. Settings and scores are browser-local, and no application-specific environment variables are read.

## Development and Usage

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm dev
pnpm build
pnpm preview
```

Use **Play** to start typing digits, **Practice** to reveal a selected section of pi, and **Options** to change timeout and grouping. Scores belong to the browser storage for the current origin.

## Build and Deployment

`pnpm build` runs `vite build` and writes the static site to `dist`. Vercel is configured through `vercel.json`; the service worker is available only over HTTPS.

## Testing and Linting

No automated tests, type checking, linting, or formatting scripts are defined. Use `pnpm build` and `pnpm preview` for available validation.

## Additional Notes

The bundled pi string is finite, so practice and game input are bounded by the digits included in `src/script.js`. Timeout and display-group settings are clamped by the client code.
