import { camelCase, snakeCase } from "change-case";
import { Sequelize, Transaction } from "sequelize";
import { connection } from "./connection";
import QueryTypes from "./QueryTypes";
import mysql2 from "mysql2";

class MySqlDb {
  private transaction?: Transaction;
  public connection: Sequelize;

  constructor() {
    this.connection = new Sequelize(
      process.env.DB_DATABASE || "",
      process.env.DB_USER || "",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        dialectModule: mysql2,
        pool: {
          min: 0,
          max: 1,
          idle: 1000,
        },
      }
    );
  }

  public async start(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await this.connection.transaction();
    }
  }

  public async commit(): Promise<void> {
    if (this.transaction) {
      await this.transaction.commit();
      this.transaction = undefined;
    }
  }

  public async rollback(): Promise<void> {
    if (this.transaction) {
      await this.transaction.rollback();
      this.transaction = undefined;
    }
  }

  getTransaction(conn: Sequelize): Transaction | undefined {
    if (!this.transaction) {
      return undefined;
    }
    const connDatabase = conn.config.database;
    const connHost = conn.config.host;

    const tranDatabase = this.transaction["connection"].config.database;
    const tranHost = this.transaction["connection"].config.host;

    if (connDatabase === tranDatabase && connHost === tranHost) {
      return this.transaction;
    }
    return undefined;
  }

  async execute(
    sql: string,
    params?: Record<string, unknown>,
    queryType = QueryTypes.SELECT,
    conn?: Sequelize
  ): Promise<Record<string, unknown> | Record<string, unknown>[] | unknown> {
    try {
      const activeConnection = conn || this.connection;
      const rows = (await activeConnection.query(sql, {
        replacements: params,
        type: queryType,
        transaction: this.getTransaction(activeConnection),
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
        return affectedRows ? params : null;
      }

      if (queryType === QueryTypes.DELETE) {
        return rows ? null : params;
      }
    } catch (e) {
      // eslint-disable-next-line
      console.log(JSON.stringify(e));
      if (queryType !== QueryTypes.SELECT) {
        throw e;
      }
    }
    return null;
  }

  async getOne<T>(
    sqlOrTable: string,
    params?: Record<string, unknown>,
    conn?: Sequelize
  ): Promise<T> {
    let results;
    if (sqlOrTable.toLowerCase().includes("select")) {
      results = await this.execute(sqlOrTable, params, QueryTypes.SELECT, conn);
    } else {
      let condition = "";
      if (params) {
        condition = `WHERE ${Object.keys(params)
          .map((key) => `${snakeCase(key)} = :${key}`)
          .join(" AND ")}`;
      }
      const generatedSql = `SELECT * FROM ${sqlOrTable} ${condition}`;
      results = await this.execute(
        generatedSql,
        params,
        QueryTypes.SELECT,
        conn
      );
    }
    return results?.[0];
  }

  async getMany<T>(
    sqlOrTable: string,
    params?: Record<string, unknown>,
    conn?: Sequelize
  ): Promise<T[]> {
    if (sqlOrTable.toLowerCase().includes("select")) {
      return this.execute(
        sqlOrTable,
        params,
        QueryTypes.SELECT,
        conn
      ) as Promise<T[]>;
    }

    let condition = "";
    if (params) {
      condition = `WHERE ${Object.keys(params)
        .map((key) => `${snakeCase(key)} = :${key}`)
        .join(" AND ")}`;
    }
    const generatedSql = `SELECT * FROM ${sqlOrTable} ${condition}`;
    return this.execute(
      generatedSql,
      params,
      QueryTypes.SELECT,
      conn
    ) as Promise<T[]>;
  }

  async insert<T>(
    table: string,
    columns: Record<string, unknown>,
    conn?: Sequelize
  ): Promise<T> {
    const keys = Object.keys(columns);
    const sql = `INSERT INTO 
      ${table} (${keys.map((a) => `${snakeCase(a)}`)}) 
      VALUES (${keys.map((key) => `:${key}`)})`;

    return this.execute(sql, columns, QueryTypes.INSERT, conn) as Promise<T>;
  }

  async update<T>(
    sqlOrTable: string,
    condition: Record<string, unknown>,
    columns: Record<string, unknown>,
    conn?: Sequelize
  ): Promise<T> {
    if (sqlOrTable.toLowerCase().includes("update ")) {
      return this.execute(
        sqlOrTable,
        condition,
        QueryTypes.UPDATE,
        conn
      ) as Promise<T>;
    }

    const keys = Object.keys(columns);
    const conditionKeys = Object.keys(condition);

    const sql = `UPDATE ${sqlOrTable} SET 
      ${keys.map((k) => `${snakeCase(k)} = :${k}`).join(", ")}
      WHERE ${conditionKeys
        .map((k) => `${snakeCase(k)} = :${k}`)
        .join(" AND ")}`;
    return this.execute(
      sql,
      { ...condition, ...columns },
      QueryTypes.UPDATE,
      conn
    ) as Promise<T>;
  }

  async delete(
    sqlOrTable: string,
    condition: Record<string, unknown>,
    conn?: Sequelize
  ): Promise<unknown> {
    if (sqlOrTable.toLowerCase().includes("delete ")) {
      return this.execute(sqlOrTable, condition, QueryTypes.DELETE, conn);
    }
    const keys = Object.keys(condition);
    const sql = `DELETE FROM ${sqlOrTable} WHERE ${keys
      .map((k) => `${snakeCase(k)} = :${k}`)
      .join(" AND ")}`;
    return this.execute(sql, condition, QueryTypes.DELETE, conn);
  }

  private castRow(row) {
    try {
      const keys = Object.keys(row);
      const model = {};
      keys.forEach((key) => {
        if (row[key] === null) {
          model[camelCase(key)] = null;
          return;
        }

        if (Array.isArray(row[key])) {
          if (typeof row[key][0] === "object") {
            model[camelCase(key)] = row[key].map((o) => this.castRow(o));
          } else {
            model[camelCase(key)] = row[key];
          }
          return;
        }
        if (
          typeof row[key] === "object" &&
          typeof row[key].getMonth !== "function"
        ) {
          model[camelCase(key)] = this.castRow(row[key]);
          return;
        }
        model[camelCase(key)] = row[key];
      });
      return model;
    } catch (e) {
      console.log("Mysql error: ", JSON.stringify(e));
    }
    return null;
  }
}

export default MySqlDb;
export { QueryTypes, connection };
