# @repo/utils

## Overview

`@repo/utils` is the shared constants package for Marcel Projects. It provides one source of truth for the deployment domain, auth URL, and recognized application scopes.

## Exports

`index.ts` exports `BASE_DOMAIN`, `AUTH_URL`, `SCOPES`, and `ALL_SCOPES`. The supported scopes are `jwt`, `memory-pi-game`, and `music`.

The package contains no runtime services, UI, database access, or environment-variable reads.

## Architecture and Dependencies

- `index.ts` is the complete public implementation.
- `package.json` identifies the workspace as `@repo/utils`.
- `tsconfig.json` provides the package TypeScript configuration.

There are no runtime dependencies or required environment variables.

## Development and Usage

From the monorepo root, run `pnpm install`. This package defines no development, build, test, lint, or format scripts.

```ts
import { ALL_SCOPES, AUTH_URL, SCOPES } from "@repo/utils";
```

The auth package uses these values for trusted origins, redirects, cookies, and access checks. The admin app uses `ALL_SCOPES` when editing user permissions.

## Build and Deployment

There is no standalone build or deployment step. The package is included in builds of consuming workspaces.

## Additional Notes

Changing a scope or deployment URL affects authentication redirects and authorization across the monorepo. Update consuming app configuration and deployed hostnames together.
