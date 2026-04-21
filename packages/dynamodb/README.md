# @the-neon/dynamodb

DynamoDB client for Neon using AWS SDK v3.

## Install

```bash
npm install @the-neon/dynamodb
```

Requires `@the-neon/core` as a peer dependency.

## Usage

```typescript
import DynamoDb from "@the-neon/dynamodb";

const db = new DynamoDb();

// CRUD
await db.insert("users", { id: "1", name: "Alice", email: "alice@example.com" });
await db.update("users", { id: "1", name: "Alice Updated" });
await db.delete("users", "1");

// Fetch
await db.getById("users", "1");
await db.query("users", { tenantId: "abc" }, "tenant-index");
await db.scan("users", { status: "active" });
```

## API

- `getById(table, id)` — Get item by primary key
- `query(table, attrs, index?)` — Query with attribute filters
- `scan(table, attrs?, filterExpression?, expressionAttributeNames?, expressionAttributeValues?)` — Scan table
- `insert(table, input)` — Put new item (generates UUID if id not provided)
- `update(table, data)` — Update item by id
- `delete(table, id)` — Delete item by id
- `mapAttrToParams(attrs)` — Map attributes to DynamoDB expression params
