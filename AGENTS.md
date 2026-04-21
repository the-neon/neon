# Neon

## Packages (monorepo via pnpm workspaces)

- `@the-neon/core` — decorators, errors, interfaces
- `@the-neon/gql` — GraphQL generator CLI (`bin/neon.js`)
- `@the-neon/validation` — Validator
- `@the-neon/pg` — PostgreSQL support
- `@the-neon/mysql` — MySQL support
- `@the-neon/dynamodb` — DynamoDB support

## Developer Commands

```bash
pnpm install          # install dependencies (after pnpm import if migrating from yarn)
pnpm run build        # build all packages (tsc --build with project references)
pnpm run build:core   # build core only
pnpm run build:pg      # build pg only
pnpm run build:gql     # build gql only
pnpm test             # all packages, with coverage
pnpm pretty           # format all packages (prettier)
```

Output goes to `packages/*/lib/`.

## Important Constraints

- **Node.js 24+ required** (`engines.node: ">= 24.0.0"`)
- **TypeScript 5.x** — root tsconfig extends `@tsconfig/node24`
- **Package manager: pnpm** — yarn.lock was replaced by pnpm-lock.yaml. Do not run yarn; use pnpm.
- **Pre-commit hooks** — husky v4 + lint-staged. Keep `packageManager` field absent from root package.json to avoid husky misinterpreting it.

## Test

Jest is configured at root, per-package configs extend it. Test files are `*.test.ts`.

## TypeScript

Root tsconfig.json uses project references to link packages. Base config extends `@tsconfig/node24`, sets `strict: true`, `skipLibCheck: true`, `composite: false`.

## CLI

`bin/neon.js` runs the GQL generator from `packages/gql/lib/generator/index`.

## Known Peer Dependency Warnings

These are expected and can be ignored (no compatible versions available):
- `graphql-iso-date@3.6.1` and `graphql-type-long@0.1.1` — peer dep on old `graphql@^0.x` through `^14.x`
- `graphql-tools@7.0.0` — transitive unmet peer dep on `graphql-ws@>=0.11 <=15`
