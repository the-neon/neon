import { camelCase, snakeCase } from "change-case";
import { Transaction } from "sequelize";
import { connection } from "./connection";
import QueryTypes from "./QueryTypes";

class MySqlDb {
  private transaction?: Transaction;

  public async start(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await connection.transaction();
    }
  }

  public async commit(): Promise<void> {
    if (this.transaction) {
      await this.transaction.commit();
      this.transaction = undefined;
    }
  }

  async execute(
    sql: string,
    params?: Record<string, unknown>,
    queryType = QueryTypes.SELECT
  ): Promise<Record<string, unknown> | Record<string, unknown>[] | null> {
    try {
      const rows = (await connection.query(sql, {
        replacements: params,
        type: queryType,
        transaction: this.transaction,
      })) as unknown[];

      if (queryType === QueryTypes.SELECT) {
        const results = rows.map((row) => this.castRow(row));
        return results;
      }

      if (queryType === QueryTypes.INSERT) {
        const [id] = rows;
        return { id, ...params };
      }

      if (queryType === QueryTypes.UPDATE) {
        const [, affectedRows] = rows;
        return affectedRows ? { params } : null;
      }

      if (queryType === QueryTypes.DELETE) {
        return rows ? null : { params };
      }
    } catch (e) {
      // eslint-disable-next-line
      console.log(JSON.stringify(e));
    }
    return null;
  }

  async getOne(
    sqlOrTable: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    let results;
    if (sqlOrTable.toLowerCase().startsWith("select")) {
      results = await this.execute(sqlOrTable, params);
    } else {
      let condition = "";
      if (params) {
        condition = `WHERE ${Object.keys(params)
          .map((key) => `${snakeCase(key)} = :${key}`)
          .join(" AND ")}`;
      }
      const generatedSql = `SELECT * FROM ${sqlOrTable} ${condition}`;
      results = await this.execute(generatedSql, params);
    }
    return results?.[0];
  }

  async getMany(
    sqlOrTable: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>[]> {
    if (sqlOrTable.toLowerCase().startsWith("select")) {
      return this.execute(sqlOrTable, params) as Promise<
        Record<string, unknown>[]
      >;
    }

    let condition = "";
    if (params) {
      condition = `WHERE ${Object.keys(params)
        .map((key) => `${snakeCase(key)} = :${key}`)
        .join(" AND ")}`;
    }
    const generatedSql = `SELECT * FROM ${sqlOrTable} ${condition}`;
    return this.execute(generatedSql, params) as Promise<
      Record<string, unknown>[]
    >;
  }

  async insert(
    table: string,
    columns: Record<string, unknown>
  ): Promise<unknown> {
    const keys = Object.keys(columns);
    const sql = `INSERT INTO 
      ${table} (${keys.map((a) => `${snakeCase(a)}`)}) 
      VALUES (${keys.map((key) => `:${key}`)})`;

    return this.execute(sql, columns, QueryTypes.INSERT);
  }

  async update(
    table: string,
    condition: Record<string, unknown>,
    columns: Record<string, unknown>
  ): Promise<unknown> {
    const keys = Object.keys(columns);
    const conditionKeys = Object.keys(condition);

    const sql = `UPDATE ${table} SET 
      ${keys.map((k) => `${snakeCase(k)} = :${k}`).join(", ")}
      WHERE ${conditionKeys
        .map((k) => `${snakeCase(k)} = :${k}`)
        .join(" AND ")}`;
    return this.execute(sql, { ...condition, ...columns }, QueryTypes.UPDATE);
  }

  async delete(
    table: string,
    condition: Record<string, unknown>
  ): Promise<unknown> {
    const keys = Object.keys(condition);
    const sql = `DELETE FROM ${table} WHERE ${keys
      .map((k) => `${snakeCase(k)} = :${k}`)
      .join(" AND ")}`;
    return this.execute(sql, condition, QueryTypes.DELETE);
  }

  private castRow(row) {
    const keys = Object.keys(row);
    const model = {};
    keys.forEach(
      (key) =>
        (model[camelCase(key)] =
          typeof row[key] === "object" ? this.castRow(row[key]) : row[key])
    );
    return model;
  }
}

export default MySqlDb;
export { QueryTypes };
