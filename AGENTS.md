# Neon

## Packages (pnpm workspaces)

- `@the-neon/core` — decorators, errors, interfaces
- `@the-neon/gql` — GraphQL generator CLI (`bin/neon.js`)
- `@the-neon/validation` — Validator
- `@the-neon/pg` — PostgreSQL support
- `@the-neon/mysql` — MySQL support
- `@the-neon/dynamodb` — DynamoDB support

## Developer Commands

```bash
pnpm install      # install dependencies
pnpm run build    # build all packages (tsc --build with project references)
pnpm run build:core
pnpm run build:pg
pnpm run build:mysql
pnpm run build:dynamodb
pnpm run build:validation
pnpm run build:gql
pnpm run clean   # rm -rf packages/*/lib
pnpm test        # all packages, with coverage (root jest)
pnpm pretty      # prettier --write all packages
```

Build output goes to `packages/*/lib/`.

## CI pipeline

```
pnpm install --frozen-lockfile
pnpm run build
pnpm run test
```

## Constraints

- **Node.js 24+ required** (`engines.node: ">= 24.0.0"`)
- **TypeScript 5.x** — root tsconfig extends `@tsconfig/node24`, strict, skipLibCheck
- **Package manager: pnpm** — yarn.lock replaced by pnpm-lock.yaml. Do not run yarn.
- **Pre-commit hooks** — husky v4 + lint-staged (prettier on all files, eslint --fix on .ts files)

## Test

Jest is configured at root, per-package configs extend it. Test files are `*.test.ts`. Ignore `/lib/` and `/node_modules/` in test paths.

## CLI

`bin/neon.js` runs the GQL generator from `packages/gql/lib/generator/index`.

## Known Peer Dependency Warnings (expected, ignore)

- `graphql-iso-date@3.6.1` and `graphql-type-long@0.1.1` — old `graphql@^0.x` peer dep through `^14.x`
- `graphql-tools@7.0.0` — transitive unmet peer dep on `graphql-ws@>=0.11 <=15`

## Version / Publish

```bash
pnpm run version:patch  # bumps all workspaces
pnpm run publish        # clean -> build -> publish all packages (--access public --no-git-checks)
```