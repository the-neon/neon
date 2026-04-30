# @the-neon/core

Core decorators, errors, and interfaces for Neon.

## Install

```bash
npm install @the-neon/core
```

## Usage

```typescript
import {
  Action,
  SkipAuthorization,
  ErrorPrefix,
  ApplicationError,
  AuthenticationError,
  AuthorizationError,
  InputError,
  ItemNotFoundError,
  IAppContext,
  IAuthenticatedUser,
} from "@the-neon/core";
```

## Enums

### Action

Bitmask for access control:

```typescript
Action.Read    // 1
Action.Write   // 2
Action.Delete  // 4
Action.Execute // 8
Action.Approve // 16
```

### SkipAuthorization

Bypass auth checks:

```typescript
SkipAuthorization.yes
SkipAuthorization.no
```

### ErrorPrefix

Error code prefixes for `ApplicationError`:

```typescript
ErrorPrefix.Authentication              // "AUTH"
ErrorPrefix.Authorization                // "AZ"
ErrorPrefix.Custom                        // "CUS"
ErrorPrefix.ConstraintViolation          // "CV"
ErrorPrefix.InputValidation             // "IV"
ErrorPrefix.InputValidationInvalidFormat // "IV.IFMT"
ErrorPrefix.InputValidationRequired     // "IV.RQ"
ErrorPrefix.InputValidationSmallerThan  // "IV.ST"
ErrorPrefix.InputValidationGreaterThan  // "IV.GT"
ErrorPrefix.NotSupportedAppVersion     // "NSAV"
ErrorPrefix.System                      // "SYS"
```

## Interfaces

### IAppContext

Application context for requests:

```typescript
interface IAppContext {
  token?: string;
  connectionId?: string;
  user?: IAuthenticatedUser;
}
```

### IAuthenticatedUser

Authenticated user data:

```typescript
interface IAuthenticatedUser {
  id: string;
  tenantId: string;
}
```

## Errors

### ApplicationError

Base error with prefix, affected fields, and message:

```typescript
throw new ApplicationError(ErrorPrefix.InputValidation, ["email"], "Invalid email");
```

### AuthenticationError

User not authenticated:

```typescript
throw new AuthenticationError();
throw new AuthenticationError("Custom message");
```

### AuthorizationError

User not authorized:

```typescript
throw new AuthorizationError();
```

### InputError

Request input validation failure:

```typescript
throw new InputError("Validation failed", [new Map([["email", "Invalid email"]])]);
```

### ItemNotFoundError

Requested item not found:

```typescript
throw new ItemNotFoundError();
```

## Type Aliases

```typescript
const integer: number;
const long: number;
const float: number;
const timestamp: Date;
```
