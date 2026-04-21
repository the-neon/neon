# @the-neon/mysql

MySQL client for Neon using Sequelize.

## Install

```bash
npm install @the-neon/mysql
```

## Usage

Requires environment variables:

- `DB_HOST` — Database host
- `DB_DATABASE` — Database name
- `DB_USER` — Database user
- `DB_PASSWORD` — Database password

```typescript
import MySqlDb, { QueryTypes } from "@the-neon/mysql";

const db = new MySqlDb();

// Transactions
await db.start();
await db.commit();
await db.rollback();

// CRUD
await db.insert<User>("users", { name: "Alice", email: "alice@example.com" });
await db.update<User>("users", { id: 1 }, { name: "Alice Updated" });
await db.delete("users", { id: 1 });

// Fetch
await db.getOne<User>("users", { id: 1 });
await db.getMany<User>("users", { tenantId: "abc" });
await db.execute("SELECT * FROM users WHERE id = :id", { id: 1 });
```

## API

- `start()` — Begin transaction
- `commit()` — Commit transaction
- `rollback()` — Rollback transaction
- `execute(sql, params?, queryType?, conn?)` — Execute raw SQL
- `insert(table, columns, conn?)` — Insert row
- `update(sqlOrTable, condition, columns, conn?)` — Update rows
- `delete(sqlOrTable, condition, conn?)` — Delete rows
- `getOne(sqlOrTable, params?, conn?)` — Fetch single row
- `getMany(sqlOrTable, params?, conn?)` — Fetch multiple rows

## Query Types

```typescript
import { QueryTypes } from "@the-neon/mysql";

QueryTypes.SELECT
QueryTypes.INSERT
QueryTypes.UPDATE
QueryTypes.DELETE
```
