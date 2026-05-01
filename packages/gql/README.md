# @the-neon/gql

GraphQL support for Neon — includes a CLI generator and server utilities.

## Install

```bash
npm install @the-neon/gql
```

Requires `@the-neon/core` and `aws-amplify` as peer dependencies.

## CLI

Generate GraphQL client code from schema:

```bash
neon generate <schema>
```

## Usage

```typescript
import {
  AuthDirective,
  Authorizer,
  errorHandler,
  User,
} from "@the-neon/gql";
```

## AuthDirective

GraphQL schema directive for authentication/authorization:

```typescript
directive @auth(action: String!) on FIELD_DEFINITION
```

## Authorizer

Authorization helper for resolving user permissions:

```typescript
const authorizer = new Authorizer(context);
const allowed = authorizer.can(Action.Write, "resource");
```

## errorHandler

GraphQL error handler for Apollo Server:

```typescript
const server = new ApolloServer({
  // ...
  formatError: errorHandler,
});
```

## User

User helper for extracting user from context:

```typescript
const user = User.fromContext(context);
const userId = user?.id;
```
