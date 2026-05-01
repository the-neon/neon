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

### Built-in Validators

- `Validator.email` — Validates email format
- `Validator.notEmpty` — Validates not null/undefined/empty string
- `Validator.uuid` — Validates UUID format
- `Validator.greaterThanZero` — Validates number > 0

## Example

```typescript
class UserService {
  @Validate({
    email: Validator.email,
    name: Validator.notEmpty,
  })
  async createUser(email: string, name: string) {
    // validation runs before the method
  }
}

// Throws InputError if validation fails
await userService.createUser("invalid-email", "");
```

## Custom Validation Functions

```typescript
import { Validate, Validator } from "@the-neon/validation";

const customValidator = (value: any) => {
  if (!isValid(value)) {
    throw new Error("Custom validation failed");
  }
};

class MyService {
  @Validate({
    data: customValidator,
  })
  async process(data: any) {
    // ...
  }
}
```

## API

### @Validate

Decorator that validates method arguments:

```typescript
@Validate(validators: {
  [paramName: string]: Validator | Validator[] | ValidationFunction | ValidationFunction[];
}, functions?: ValidationFunction | ValidationFunction[])
```

### Validator

Enum of built-in validators:

```typescript
Validator.email
Validator.notEmpty
Validator.uuid
Validator.greaterThanZero
```
