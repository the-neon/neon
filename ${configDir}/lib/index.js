"use strict";
/*eslint @typescript-eslint/no-explicit-any: "off"*/
/*@typescript-eslint/explicit-module-boundary-types: "off"*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var pg_1 = require("pg");
// import { IAppContext } from '../../core/Context';
// import { SkipAuthorization, Tables } from '../../core/enums';
// import { TyxAuthorizationError } from '../../core/Errors';
// import ServiceResolver from '../../core/ServiceResolver';
// import ConfigService from '../ConfigService';
// import IDb from '../IDb';
// import ILogger from '../ILogger';
// import DatabaseMap from './DatabaseMap';
// interface SortRequest {
//   sortField: string;
//   sortOrder: string;
//   filter: string | string[];
// }
var PostgresDB = /** @class */ (function () {
    //   private ctx: IAppContext;
    //   private logger: ILogger;
    function PostgresDB(connectionString) {
        this.transaction = false;
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
        this.toArray = function (args) {
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
        this.connectionString = connectionString;
        // this.logger = ServiceResolver.resolve<ILogger>('ILogger');
        // this.ctx = ctx;
    }
    // TODO: identifier
    PostgresDB.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.transaction = true;
                        return [4 /*yield*/, this.execute("BEGIN")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // TODO: identifier
    PostgresDB.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.transaction = false;
                        return [4 /*yield*/, this.execute("COMMIT")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // TODO: identifier
    PostgresDB.prototype.rollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.transaction = false;
                        return [4 /*yield*/, this.execute("ROLLBACK")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDB.prototype.queryAsJson = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var final;
            return __generator(this, function (_a) {
                final = "SELECT to_json(tmp.*) as item FROM (".concat(sql, ") as tmp");
                return [2 /*return*/, this.query(final, args)];
            });
        });
    };
    PostgresDB.prototype.query = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var db, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDataStore()];
                    case 1:
                        db = _a.sent();
                        try {
                            resp = db.query(sql, args);
                            return [2 /*return*/, resp];
                        }
                        catch (ex) {
                            console.error("DB Exception: ", ex);
                        }
                        finally {
                            if (db && !this.transaction && this._client) {
                                db.release();
                                this._client = undefined;
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDB.prototype.execute = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, args)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp["rowCount"]];
                }
            });
        });
    };
    PostgresDB.prototype.insert = function (table, columns) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var sanTable, keys, values, sql, resp;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sanTable = this.sanitize(table);
                        keys = Object.keys(columns);
                        values = Object.values(columns);
                        sql = "INSERT INTO ".concat(sanTable, " (").concat(keys.map(function (a) { return "".concat(_this.toSnakeCase(a)); }), ") \n      VALUES (").concat(keys.map(function (_, ndx) { return "$".concat(ndx + 1); }), ") RETURNING *");
                        return [4 /*yield*/, this.query(sql, values)];
                    case 1:
                        resp = _b.sent();
                        return [2 /*return*/, this.castRow((_a = resp === null || resp === void 0 ? void 0 : resp["rows"]) === null || _a === void 0 ? void 0 : _a[0])];
                }
            });
        });
    };
    PostgresDB.prototype.update = function (table, filter, columns) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var sanTable, keys, values, setters, sql, resp;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sanTable = this.sanitize(table);
                        keys = Object.keys(columns);
                        values = Object.values(columns);
                        setters = keys.map(function (k, ndx) { return "".concat(_this.toSnakeCase(k), "=$").concat(ndx + 1); });
                        sql = "UPDATE ".concat(sanTable, " SET \n      ").concat(setters.join(), "\n      WHERE ").concat(this.generateCondition(filter, values.length), " \n      RETURNING *");
                        return [4 /*yield*/, this.query(sql, __spreadArray(__spreadArray([], values, true), this.toArray(filter), true))];
                    case 1:
                        resp = _b.sent();
                        return [2 /*return*/, this.castRow((_a = resp === null || resp === void 0 ? void 0 : resp["rows"]) === null || _a === void 0 ? void 0 : _a[0])];
                }
            });
        });
    };
    PostgresDB.prototype["delete"] = function (table, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var sanTable, sql, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sanTable = this.sanitize(table);
                        sql = "DELETE FROM ".concat(sanTable, " WHERE ").concat(this.generateCondition(filter), " RETURNING *");
                        return [4 /*yield*/, this.query(sql, this.toArray(filter))];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp["rows"][0]];
                }
            });
        });
    };
    PostgresDB.prototype.getOne = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, args)];
                    case 1:
                        model = _a.sent();
                        if (model && model["rowCount"] === 1) {
                            return [2 /*return*/, this.castRow(model["rows"][0])];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    PostgresDB.prototype.getMany = function (sql, args) {
        return __awaiter(this, void 0, void 0, function () {
            var model;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query(sql, args)];
                    case 1:
                        model = _a.sent();
                        if (model && (model === null || model === void 0 ? void 0 : model["rowCount"]) > 0) {
                            return [2 /*return*/, model === null || model === void 0 ? void 0 : model["rows"].map(function (row) { return _this.castRow(row); })];
                        }
                        return [2 /*return*/, []];
                }
            });
        });
    };
    PostgresDB.prototype.getById = function (table, id, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getByIds(table, [id], filter)];
                    case 1:
                        rows = _a.sent();
                        if (rows && rows.length === 1) {
                            return [2 /*return*/, rows[0]];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    PostgresDB.prototype.getByIds = function (table, ids, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var sanTable, where, sql, rows;
            return __generator(this, function (_a) {
                sanTable = this.sanitize(table);
                where = "";
                if (filter) {
                    where = "WHERE ".concat(this.generateCondition(filter, ids.length));
                }
                sql = "SELECT * FROM ".concat(sanTable, " WHERE id in (").concat(ids.map(function (_, ndx) { return "$".concat(ndx + 1); }), ") ").concat(where);
                rows = this.getMany(sql, __spreadArray(__spreadArray([], ids, true), Object.values(filter !== null && filter !== void 0 ? filter : {}), true));
                return [2 /*return*/, rows];
            });
        });
    };
    PostgresDB.prototype.getCount = function (table, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var where, sql, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = "";
                        if (filter) {
                            where = "WHERE ".concat(this.generateCondition(filter));
                        }
                        sql = "SELECT count(*) count FROM ".concat(this.sanitize(table), " ").concat(where);
                        return [4 /*yield*/, this.query(sql, filter ? Object.values(filter) : [])];
                    case 1:
                        model = _a.sent();
                        if ((model === null || model === void 0 ? void 0 : model["rowCount"]) === 1) {
                            return [2 /*return*/, {
                                    count: parseInt(model === null || model === void 0 ? void 0 : model["rows"][0].count, 10)
                                }];
                        }
                        return [2 /*return*/, { count: 0 }];
                }
            });
        });
    };
    PostgresDB.prototype.generateCondition = function (filter, parameterOffset) {
        var _this = this;
        var keys = [];
        if (typeof filter === "string") {
            keys = ["id"];
        }
        else if (filter) {
            keys = Object.keys(filter);
        }
        else {
            return "1=1";
        }
        return keys
            .map(function (k, idx) {
            return "".concat(_this.toSnakeCase(k), "=$").concat((parameterOffset || 0) + idx + 1);
        })
            .join(" AND ");
    };
    PostgresDB.prototype.toSnakeCase = function (str) {
        return (str &&
            str
                .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(function (x) { return x.toLowerCase(); })
                .join("_"));
    };
    PostgresDB.prototype.getDataStore = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!PostgresDB.pool) {
                            PostgresDB.pool = new pg_1.Pool({
                                connectionString: this.connectionString,
                                connectionTimeoutMillis: 2000
                            });
                            PostgresDB.pool.on("error", function () {
                                return null;
                            });
                            PostgresDB.pool.on("connect", function (client) {
                                client.query("SET search_path TO public");
                            });
                        }
                        if (!!this._client) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, PostgresDB.pool.connect()];
                    case 1:
                        _a._client = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this._client];
                }
            });
        });
    };
    PostgresDB.prototype.sanitize = function (table) {
        // TODO: implement
        return table;
    };
    PostgresDB.prototype.camelize = function (str) {
        return str
            .replace(/_/g, " ")
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        })
            .replace(/\s+/g, "");
    };
    PostgresDB.prototype.castRow = function (row) {
        if (!row) {
            return row;
        }
        var casted = {};
        for (var _i = 0, _a = Object.keys(row); _i < _a.length; _i++) {
            var key = _a[_i];
            if (casted[key]) {
                continue;
            }
            // Check if value of certain key is object and recursively iterate over object keys
            if (Array.isArray(row[key])) {
                var camelizedKey = this.camelize(key);
                casted[camelizedKey] = [];
                for (var _b = 0, _c = row[key]; _b < _c.length; _b++) {
                    var rowItem = _c[_b];
                    if (rowItem !== null && rowItem.toString() === "[object Object]") {
                        casted[camelizedKey].push(this.castRow(rowItem));
                    }
                    else if (rowItem) {
                        casted[camelizedKey].push(rowItem);
                    }
                }
            }
            else if (row[key] !== null &&
                row[key].toString() === "[object Object]") {
                casted[this.camelize(key)] = this.castRow(row[key]);
            }
            else {
                casted[this.camelize(key)] = row[key];
            }
        }
        return casted;
    };
    return PostgresDB;
}());
exports["default"] = PostgresDB;
