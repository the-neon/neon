# @the-neon/core

Core decorators, errors, and interfaces for Neon.

## Install

```bash
npm install @the-neon/core
```

## Usage

```typescript
import { Action, SkipAuthorization, ErrorPrefix } from "@the-neon/core";
```

## Exports

### Enums

- `Action` — Bitmask for access control: `Read`, `Write`, `Delete`, `Execute`, `Approve`
- `SkipAuthorization` — `yes` / `no` to bypass auth checks
- `ErrorPrefix` — Error code prefixes: `Authentication`, `Authorization`, `InputValidation`, etc.

### Interfaces

- `IAppContext` — Application context with `token`, `connectionId`, `user`
- `IAuthenticatedUser` — Authenticated user with `id`, `tenantId`

### Errors

- `ApplicationError` — Base error with prefix, affected fields, and message
- `AuthenticationError` — User not authenticated
- `AuthorizationError` — User not authorized
- `InputError` — Request input validation failure
- `ItemNotFoundError` — Requested item not found

### Type Aliases

- `integer`, `long`, `float`, `timestamp`
