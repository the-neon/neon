import { Pool, PoolClient } from "pg";

// import { IAppContext } from '../../core/Context';
// import { SkipAuthorization, Tables } from '../../core/enums';
// import { TyxAuthorizationError } from '../../core/Errors';
// import ServiceResolver from '../../core/ServiceResolver';
// import ConfigService from '../ConfigService';
// import IDb from '../IDb';
// import ILogger from '../ILogger';
// import DatabaseMap from './DatabaseMap';

interface SortRequest {
  sortField: string;
  sortOrder: string;
  filter: string | string[];
}

class PostgresDB {
  transaction = false;

  private static pool;
  private connectionString: string;

  //   private ctx: IAppContext;

  //   private logger: ILogger;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    // this.logger = ServiceResolver.resolve<ILogger>('ILogger');
    // this.ctx = ctx;
  }

  // TODO: identifier
  public async start(): Promise<void> {
    this.transaction = true;
    await this.execute("BEGIN");
  }

  // TODO: identifier
  public async commit(): Promise<void> {
    this.transaction = false;
    await this.execute("COMMIT");
  }

  // TODO: identifier
  public async rollback(): Promise<void> {
    this.transaction = false;
    await this.execute("ROLLBACK");
  }

  public async queryAsJson(sql: string, args?: any[]): Promise<any | void> {
    const final = `SELECT to_json(tmp.*) as item FROM (${sql}) as tmp`;
    return this.query(final, args);
  }

  public async query(sql: string, args?: any[]): Promise<any | any[] | void> {
    const db = await this.getDataStore();
    try {
      const resp = db.query(sql, args);
      return resp;
    } catch (ex) {
      // console.error("exelption :", ex);
    } finally {
      if (db && !this.transaction) {
        db.release();
      }
    }
  }

  public async execute(sql: string, args?: any[]): Promise<number> {
    const resp = await this.query(sql, args);
    return resp["rowCount"];
  }

  public async insert<T>(table: string, columns: any[]): Promise<T> {
    const sanTable = this.sanitize(table);
    // await this.authorizationCheck({ table: sanTable, columns, filter: null, skipAuth });

    const keys = Object.keys(columns);
    const values = Object.values(columns);
    const sql = `INSERT INTO ${sanTable} (${keys.map(
      (a) => `${this.toSnakeCase(a)}`
    )}) 
      VALUES (${keys.map((_, ndx) => `$${ndx + 1}`)}) RETURNING *`;
    const resp = await this.query(sql, values);
    return this.castRow<T>(resp?.["rows"]?.[0]);
  }

  public async update<T>(table: string, filter: any, columns: any): Promise<T> {
    const sanTable = this.sanitize(table);
    // await this.authorizationCheck({ table: sanTable, columns, filter, skipAuth });

    const keys = Object.keys(columns);
    const values = Object.values(columns);

    const setters = keys.map((k, ndx) => `${this.toSnakeCase(k)}=$${ndx + 1}`);
    const sql = `UPDATE ${sanTable} SET 
      ${setters.join()}
      WHERE ${this.generateCondition(filter, values.length)} 
      RETURNING *`;

    const resp = await this.query(sql, [...values, ...this.toArray(filter)]);
    return this.castRow<T>(resp?.["rows"]?.[0]);
  }

  public async delete<T>(table: string, filter: any): Promise<T> {
    const sanTable = this.sanitize(table);
    const sql = `DELETE FROM ${sanTable} WHERE ${this.generateCondition(
      filter
    )} RETURNING *`;

    const resp = await this.query(sql, this.toArray(filter));
    return resp?.["rows"][0] as T;
  }

  public async getOne<T>(sql: string, args?: any[]): Promise<T | null> {
    const model = await this.query(sql, args);
    if (model && model["rowCount"] === 1) {
      return this.castRow<T>(model["rows"][0]);
    }
    return null;
  }

  public async getMany<T>(sql: string, args?: any[]): Promise<T[]> {
    const model = await this.queryAsJson(sql, args);

    if (model && model?.["rowCount"] > 0) {
      return model?.["rows"].map((row) => this.castRow(row.item)) as T[];
    }

    return [] as T[];
  }

  public async getById<T>(
    table: string,
    id: string | number
  ): Promise<T | null> {
    const rows = await this.getByIds<T>(table, [id]);
    if (rows && rows.length === 1) {
      return rows[0] as T;
    }
    return null;
  }

  public async getByIds<T>(
    table: string,
    ids: (string | number)[]
  ): Promise<T[]> {
    const sanTable = this.sanitize(table);
    const sql = `SELECT * FROM ${sanTable} WHERE id in (${ids.map(
      (_, ndx) => `$${ndx + 1}`
    )})`;
    const rows = (this.getMany(sql, ids) as unknown) as T[];
    return rows;
  }

  public async getCount(table: string, filter: any): Promise<any> {
    const sql = `SELECT count(*) count 
      FROM ${this.sanitize(table)}
      WHERE ${this.generateCondition(filter)}`;

    const model = await this.query(sql, filter ? Object.values(filter) : []);

    if (model?.["rowCount"] === 1) {
      return {
        count: parseInt(model?.["rows"][0].count, 10),
      };
    }
    return { count: 0 };
  }
  //   private validateData = ({ columns, filter }) => {
  //     const currentUser = this.ctx.user;
  //     if (
  //       (columns?.tenant && filter?.tenant && columns.tenant !== filter.tenant) ||
  //       (columns?.tenant && currentUser && columns.tenant !== currentUser.scope) ||
  //       (filter?.tenant && currentUser && filter.tenant !== currentUser.scope)
  //     ) {
  //       throw new TyxAuthorizationError();
  //     }
  //   };

  //   private generateAuthenticationQueryParams(table, params) {
  //     const result = [this.ctx.user.scope];
  //     if (table !== Tables.Companies) {
  //       result.push(params.id || params[this.camelize(DatabaseMap[table].key)]);
  //     }
  //     return result;
  //   }

  //   private generateAuthenticationQuery(table) {
  //     let currentTable = table;
  //     let query = `SELECT count(*) cnt FROM ${table}`;
  //     do {
  //       const { key, parent } = DatabaseMap[currentTable];
  //       if (key !== 'tenant' && parent) {
  //         query += ` INNER JOIN ${parent} ON ${parent}.id = ${currentTable}.${key}`;
  //         currentTable = parent;
  //       } else {
  //         break;
  //       }
  //     } while (DatabaseMap[currentTable]);
  //     if (table === Tables.Companies) {
  //       return `${query} WHERE ${currentTable}.tenant=$1;`;
  //     }
  //     return `${query} WHERE ${currentTable}.tenant=$1 AND ${table}.id = $2;`;
  //   }

  //   private calculateStartTable(table, inputParams) {
  //     return inputParams.id ? table : DatabaseMap[table].parent;
  //   }

  //   private async authorizationCheck({ table, columns, filter, skipAuth }) {
  //     if (skipAuth === SkipAuthorization.yes) {
  //       return;
  //     }
  //     this.validateData({ columns, filter });

  //     const inputParams = { ...((typeof filter === 'string' ? { id: filter } : filter) || {}), ...(columns || {}) };
  //     const startTable = this.calculateStartTable(table, inputParams);

  //     const query = this.generateAuthenticationQuery(startTable);
  //     const params = this.generateAuthenticationQueryParams(startTable, inputParams);
  //     const res = await this.query(query, params);
  //     if (res?.rows[0]?.cnt !== '1') {
  //       throw new TyxAuthorizationError();
  //     }
  //   }

  private toArray = (args) => {
    if (!args) {
      return [];
    }
    if (args && typeof args === "object") {
      return Object.values(args);
    }
    if (Array.isArray(args)) {
      return args;
    }
    return [args];
  };

  private generateCondition(filter: any, parameterOffset?: any): string {
    let keys: string[] = [];
    if (typeof filter === "string") {
      keys = ["id"];
    } else if (filter) {
      keys = Object.keys(filter);
    } else {
      return "1=1";
    }
    return keys
      .map(
        (k, idx) =>
          `${this.toSnakeCase(k)}=$${(parameterOffset || 0) + idx + 1}`
      )
      .join(" and ");
  }

  private toSnakeCase(str) {
    return (
      str &&
      str
        .match(
          /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
        )
        .map((x) => x.toLowerCase())
        .join("_")
    );
  }

  private async getDataStore(): Promise<PoolClient> {
    if (!PostgresDB.pool) {
      PostgresDB.pool = new Pool({
        connectionString: this.connectionString,
      });
    }

    const client = await PostgresDB.pool.connect();
    return client;
  }

  private sanitize(table: string) {
    // TODO: implement
    return table;
  }

  private camelize(str: string) {
    return str
      .replace(/_/g, " ")
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  private castRow<T>(row): T {
    if (!row) {
      return row;
    }
    const casted: T = {} as T;
    for (const key of Object.keys(row)) {
      if (casted[key]) {
        continue;
      }
      // Check if value of certain key is object and recursively iterate over object keys
      if (Array.isArray(row[key])) {
        const camelizedKey = this.camelize(key);
        casted[camelizedKey] = [];
        for (const rowItem of row[key]) {
          if (rowItem !== null && rowItem.toString() === "[object Object]") {
            casted[camelizedKey].push(this.castRow(rowItem));
          } else if (rowItem) {
            casted[camelizedKey].push(rowItem);
          }
        }
      } else if (
        row[key] !== null &&
        row[key].toString() === "[object Object]"
      ) {
        casted[this.camelize(key)] = this.castRow(row[key]);
      } else {
        casted[this.camelize(key)] = row[key];
      }
    }
    return casted as T;
  }
}

export default PostgresDB;
