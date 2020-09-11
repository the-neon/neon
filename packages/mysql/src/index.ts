import { camelCase, snakeCase } from "change-case";
import { QueryTypes, Transaction } from "sequelize";
import { connection } from "./connection";

class MySqlDb {
  private transaction?: Transaction = undefined;

  public async start(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await connection.transaction();
    }
  }

  async execute(
    sql: string,
    params: any,
    queryType = QueryTypes.SELECT
  ): Promise<any> {
    try {
      const rows = (await connection.query(sql, {
        replacements: params,
        type: queryType,
        transaction: this.transaction,
      })) as any[];

      if (queryType === QueryTypes.INSERT) {
        const [id] = rows;
        return { id, ...params };
      }

      if (queryType === QueryTypes.UPDATE) {
        const [, affectedRows] = rows;
        if (affectedRows) {
          return { params };
        }
        return null;
      }

      if (queryType === QueryTypes.DELETE) {
        if (!rows) {
          return { params };
        }
        return null;
      }

      const results = rows.map((row) => {
        const keys = Object.keys(row);
        const model = {};
        keys.forEach((key) => (model[camelCase(key)] = row[key]));
        return model;
      });

      return results;
    } catch (e) {
      // eslint-disable-next-line
      console.log(JSON.stringify(e));
      return null;
    }
  }

  async getOne(sql, params): Promise<any> {
    const results = await this.execute(sql, params);
    return results && results[0];
  }

  async getMany(sql, params): Promise<any[]> {
    return this.execute(sql, params);
  }

  async insert(table, columns) {
    const keys = Object.keys(columns);
    const sql = `INSERT INTO 
      ${table} (${keys.map((a) => `${snakeCase(a)}`)}) 
      VALUES (${keys.map((key) => `:${key}`)})`;

    return this.execute(sql, columns, QueryTypes.INSERT);
  }

  async update(table, condition, columns) {
    const keys = Object.keys(columns);
    const conditionKeys = Object.keys(condition);

    const sql = `UPDATE ${table} SET 
      ${keys.map((k) => `${snakeCase(k)} = :${k}`).join(", ")}
      WHERE ${conditionKeys
        .map((k) => `${snakeCase(k)} = :${k}`)
        .join(" AND ")}`;
    return this.execute(sql, { ...condition, ...columns }, QueryTypes.UPDATE);
  }

  async delete(table, condition) {
    const keys = Object.keys(condition);
    const sql = `DELETE FROM ${table} WHERE ${keys
      .map((k) => `${snakeCase(k)} = :${k}`)
      .join(" AND ")}`;
    return this.execute(sql, condition, QueryTypes.DELETE);
  }
}

export default MySqlDb;
