# JWT Parser

## Overview

JWT Parser is a client-side Vite application for inspecting JSON Web Tokens. It is one of the tools linked from the `www` landing page.

## Functionality

- Accepts a JWT pasted into the textarea or supplied through the `t` URL query parameter.
- Highlights encoded header, payload, and signature segments.
- Base64url-decodes and JSON-parses the header and payload in the browser.
- Copies decoded header or payload content to the clipboard.
- Displays invalid-token feedback without sending token contents to a server.

The parser decodes tokens but does not verify their signatures.

## Architecture and Structure

- `src/index.html` defines the parser panels.
- `src/script.js` handles extraction, decoding, formatting, highlighting, and clipboard actions.
- `src/style.css` contains the UI styles.
- `vite.config.js` uses `src` as the root, `public` as the public directory, and writes to `dist`.
- `vercel.json` runs `pnpm build` and serves `dist`.

## Dependencies and Configuration

The only declared runtime dependency is `@repo/auth`. The current parser does not call it directly, and no application-specific environment variables are read.

## Development and Usage

From the monorepo root, run `pnpm install`. From this directory, use:

```bash
pnpm dev
pnpm build
pnpm preview
```

Paste a three-part JWT into the encoded text field to inspect its header and payload. A token can be preloaded with `/?t=<encoded-token>`; avoid sharing URLs containing sensitive tokens.

## Build and Deployment

`pnpm build` runs `vite build` and produces `dist`. Vercel is configured as the deployment platform through `vercel.json`.

## Testing and Linting

No automated tests, type checking, linting, or formatting scripts are defined. Use `pnpm build` and `pnpm preview` to validate the bundle.

## Additional Notes

Decoded payloads are untrusted input. Decoding a JWT is not authentication or signature verification.
