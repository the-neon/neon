# @the-neon/pg

PostgreSQL client for Neon with transaction support.

## Install

```bash
npm install @the-neon/pg
```

## Usage

```typescript
import PostgresDB from "@the-neon/pg";

const db = new PostgresDB("postgresql://user:pass@host:5432/db");

// Transactions
await db.start();
await db.commit();
await db.rollback();

// Query
await db.query("SELECT * FROM users WHERE id = $1", [1]);
await db.queryAsJson("SELECT * FROM users");

// CRUD
await db.insert<User>("users", { name: "Alice", email: "alice@example.com" });
await db.update<User>("users", { id: 1 }, { name: "Alice Updated" });
await db.delete<User>("users", { id: 1 });

// Fetch
await db.getOne<User>("SELECT * FROM users WHERE id = $1", [1]);
await db.getMany<User>("SELECT * FROM users");
await db.getById<User>("users", 1);
await db.getByIds<User>("users", [1, 2, 3]);
await db.getCount("users", { tenantId: "abc" });
```

## API

### Transactions

- `start()` — Begin transaction
- `commit()` — Commit transaction
- `rollback()` — Rollback transaction

### Query

- `query(sql, args?)` — Execute raw SQL, returns rowCount and rows
- `queryAsJson(sql, args?)` — Execute and return results as JSON
- `execute(sql, args?)` — Execute without return (INSERT/UPDATE/DELETE), returns rowCount

### CRUD

- `insert(table, columns)` — Insert row, returns inserted record
- `update(table, filter, columns)` — Update rows matching filter, returns updated record
- `delete(table, filter)` — Delete rows matching filter, returns deleted record

### Fetch

- `getOne(sql, args?)` — Fetch single row
- `getMany(sql, args?)` — Fetch multiple rows
- `getById(table, id, filter?)` — Fetch by id with optional filter
- `getByIds(table, ids, filter?)` — Fetch by multiple ids with optional filter
- `getCount(table, filter)` — Get row count with filter
