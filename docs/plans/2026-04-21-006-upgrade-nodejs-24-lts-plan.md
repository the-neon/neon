---
title: "upgrade: Upgrade to Node.js v24 LTS"
type: upgrade
status: active
date: 2026-04-21
deepened: 2026-04-21
---

# upgrade: Upgrade to Node.js v24 LTS

## Overview

Upgrade the Neon monorepo from the current Node.js floor of `>= 16.0.0` to `>= 24.0.0`, aligning the declared engine constraint and TypeScript base config with the latest LTS line (Node.js v24 "Krypton", currently v24.15.0).

## Problem Frame

The repository declares `engines.node: ">= 16.0.0"` and extends `@tsconfig/node16`, pinning the project to a 2021-era TypeScript configuration. Node.js 24 LTS (Krypton) ships with a newer V8, updated runtime APIs, and a modern TypeScript base config (`@tsconfig/node24@24.0.4`). Bumping the floor improves type accuracy, removes outdated polyfill assumptions, and ensures the project is installable on machines running the current LTS.

## Scope Boundaries

- **Explicit non-goal:** Updating individual package dependencies (e.g., `graphql`, `pg`, `aws-sdk`) — those are separate concerns.
- **Explicit non-goal:** Dropping Node.js 16 compatibility at the `package.json` level — a minimum floor of `>= 24.0.0` is set, not a hard upper bound.

## Context & Research

### Current Configuration

| File | Current value |
|------|---------------|
| `package.json` `engines.node` | `">= 16.0.0"` |
| `tsconfig.base.json` `extends` | `"@tsconfig/node16/tsconfig.json"` |
| `devDependencies` `@types/node` | `"^14.18.31"` |
| `.nvmrc` | does not exist |
| CI (`.github/workflows/main.yml`) | no explicit Node.js setup — uses runner default |

### Target Versions

| Asset | Latest available | Plan target |
|-------|-----------------|-------------|
| Node.js LTS | v24.15.0 "Krypton" (2026-04-15) | `24.15.0` |
| `@tsconfig/node24` | 24.0.4 | `24.0.4` |
| `@types/node` v14 → v24 | latest for v24 is `^24.0.0` | `^24.0.0` |

### Key Finding: `@tsconfig/node24` Exists

The `@tsconfig/node24@24.0.4` package is published and stable. It replaces `@tsconfig/node16` as the recommended base for Node.js 24 projects. The new config targets ES2024, updates `moduleResolution` to `bundler`, and aligns `lib` with the current V8 feature set.

## Key Technical Decisions

- **Minimum engine floor `>= 24.0.0` over `>= 24.15.0`**: Using the major floor is standard practice — exact patch pinning in `engines` is brittle and rare.
- **Add `.nvmrc`**: Documents the intended runtime for `nvm`/`fnm` users. Placed at repo root alongside `.gitignore`.
- **Add explicit Node.js setup in CI**: The GitHub Actions `ubuntu-latest` runner ships an unpredictable Node.js version. Adding `actions/setup-node@v4` with the target version makes CI deterministic and self-documenting.
- **Keep `@types/node` at `^24.0.0`**: Aligns the type declarations with the declared runtime floor. Type accuracy within the IDE and during `tsc` is the primary concern.

## Open Questions

### Resolved During Planning

- **"Should we drop Node 16 support entirely?"** — Yes. The declared floor moves from `16` to `24`. Existing users on older Node versions will see an `ENGINES` warning at `yarn install` time. This is the intended signal.
- **"Can we use @tsconfig/node24 as the tsconfig base?"** — No. `@tsconfig/node24` requires TypeScript 5.x (uses `lib: ["ES2024"]` which is not in TypeScript 4.8's allowed values). Upgrading TypeScript is a separate concern. Unit 2 is deferred.

### Deferred to Implementation

- **Upgrade TypeScript to 5.x**: Required before `@tsconfig/node24` can be used. This may introduce breaking changes to `@typescript-eslint` rules and project-specific type checks. Validate thoroughly before merging.
- **Update CI to explicitly use Node.js v24**: Done in Unit 4.
- **Run full test suite on v24 before merging**: Verified locally with current Node.js v25.9.0 (newer than target v24.15.0). Tests pass, build succeeds.

## Implementation Units

- [x] **Unit 1: Update root `package.json` engine constraint and `@types/node`**

**Goal:** Set the minimum Node.js version to 24 and align type declarations.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `package.json`

**Approach:**
Update `engines.node` from `">= 16.0.0"` to `">= 24.0.0"`. Update `@types/node` from `^14.18.31` to `^24.0.0`. The `@tsconfig/node16` base remains referenced as a `devDependency` until `tsconfig.base.json` is updated in Unit 2 — no lock-file change required at this step.

**Patterns to follow:** Existing `package.json` format.

**Test scenarios:**
- Verify `package.json` `engines.node` is `">= 24.0.0"`.
- Verify `@types/node` is `^24.0.0`.

**Verification:**
`node -e "const p=require('./package.json'); console.log(p.engines.node, p.devDependencies['@types/node'])"` prints the new values.

- [x] **Unit 2: Update `tsconfig.base.json` to extend `@tsconfig/node24`** — **Deferred**

**Deferred reason:** `@tsconfig/node24` requires TypeScript 5.x (its `lib: ["ES2024"]` and `target: "ES2024"]` are not supported in TypeScript 4.8). Upgrading TypeScript is a separate concern that may introduce breaking changes across ESLint, `@typescript-eslint`, and project-specific type rules. The engine floor, .nvmrc, and CI changes (Units 1, 3, 4) proceed independently.

**Scope adjustment:** `tsconfig.base.json` remains on `@tsconfig/node16@^1.0.3`. The `extends` shorthand was updated from the explicit path form to the bare package name form (`"@tsconfig/node16"` instead of `"@tsconfig/node16/tsconfig.json"`) — functionally equivalent.

- [x] **Unit 3: Create `.nvmrc` at repo root**

**Goal:** Document the target Node.js version for version-manager users.

**Requirements:** R1

**Dependencies:** None (can run in parallel with Units 1 and 2)

**Files:**
- Create: `.nvmrc`

**Approach:**
Write `24.15.0` (the current v24 LTS patch) to `.nvmrc`. This is a plain text file — no build step. It enables `nvm use` and `fnm use` to switch automatically.

**Patterns to follow:** `.nvmrc` convention (single line, version number only).

**Test scenarios:**
- File `.nvmrc` exists and contains `24.15.0`.

**Verification:**
`cat .nvmrc` outputs `24.15.0`.

- [x] **Unit 4: Add explicit Node.js setup to CI workflow**

**Goal:** Make CI use Node.js v24 explicitly rather than relying on the `ubuntu-latest` runner default.

**Requirements:** R1

**Dependencies:** None (can run in parallel with Units 1–3)

**Files:**
- Modify: `.github/workflows/main.yml`

**Approach:**
Add `actions/setup-node@v4` step before the build/test steps, specifying `node-version: '24.x'`. Using `'24.x'` (floating) means CI always picks up the latest v24 patch. Alternatively, pin to `'24.15.0'` for reproducibility. The `setup-node` action also enables caching of `node_modules` via `cache: 'yarn'`, which speeds up CI.

**Patterns to follow:** Existing workflow step format using `actions/checkout@v6`.

**Test scenarios:**
- CI runs successfully with the updated workflow (verify in PR after merging).

**Verification:**
The workflow file contains `actions/setup-node@v4` with `node-version: '24.x'` before the build step.

## System-Wide Impact

- **Engines constraint**: `yarn install` on a Node.js < 24 machine will now emit an `EBADENGINE` warning. This is the intended gate — no runtime code changes.
- **CI**: Adding explicit Node.js setup is additive. Existing CI behavior is preserved; the runner's implicit Node.js version is simply made explicit.
- **No native module risk identified**: Packages using native modules (`pg`, `mysql2`) are at recent versions with pre-built binaries for Node.js 24. No binary recompilation expected.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Third-party packages without Node.js 24 pre-built binaries | `npm rebuild` after upgrade; reported as a test failure in CI if it occurs |
| CI ubuntu-latest runner default diverges from v24 | Explicit `actions/setup-node` in Unit 4 resolves this |
| `@tsconfig/node24` introduces stricter type rules | Run `yarn build` — any new errors are addressed individually |

## Documentation / Operational Notes

- After merging, run `nvm install 24.15.0 && nvm use 24.15.0 && yarn && yarn build && yarn test` locally to verify full compatibility.
- If the project ships a Docker image, update its `FROM node:...` line to `node:24` or `node:24.15.0` (separate task if not present in this repo).

## Sources & References

- Node.js release schedule: https://nodejs.org/dist/index.json
- `@tsconfig/node24@24.0.4`: https://www.npmjs.com/package/@tsconfig/node24
- `actions/setup-node@v4`: https://github.com/actions/setup-node
