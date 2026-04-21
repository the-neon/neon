# @the-neon/validation

Method argument validation for Neon using decorators.

## Install

```bash
npm install @the-neon/validation
```

Requires `@the-neon/core` as a peer dependency.

## Usage

```typescript
import { Validate, Validator } from "@the-neon/validation";
```

## Validators

- `Validator.email` — Validates email format
- `Validator.notEmpty` — Validates not null/undefined/empty
- `Validator.uuid` — Validates UUID format
- `Validator.greaterThanZero` — Validates number > 0

## Example

```typescript
class MyService {
  @Validate({
    email: Validator.email,
    name: Validator.notEmpty,
  })
  async createUser(email: string, name: string) {
    // ...
  }
}
```
