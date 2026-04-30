# Neon

A TypeScript monorepo providing database clients, GraphQL utilities, and validation decorators for Node.js services.

## Packages

| Package | Description |
|---------|-------------|
| [`@the-neon/core`](packages/core) | Core decorators, errors, and interfaces |
| [`@the-neon/gql`](packages/gql) | GraphQL generator CLI and server utilities |
| [`@the-neon/pg`](packages/pg) | PostgreSQL client with transaction support |
| [`@the-neon/mysql`](packages/mysql) | MySQL client using Sequelize |
| [`@the-neon/dynamodb`](packages/dynamodb) | DynamoDB client using AWS SDK v3 |
| [`@the-neon/validation`](packages/validation) | Method argument validation with decorators |

## Requirements

- Node.js 24+
- pnpm

## Install

```bash
pnpm install
```

## Build

```bash
pnpm run build
```

## Test

```bash
pnpm test
```

## License

MIT
