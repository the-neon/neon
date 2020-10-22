import { DynamoDB } from "aws-sdk";
import { v1 as uuidv1 } from "uuid";
import { DocumentClient, QueryInput } from "aws-sdk/clients/dynamodb";

class DynamoDb {
  private _dbClient: DocumentClient | null = null;

  private get dbClient(): DocumentClient {
    if (!this._dbClient) {
      this._dbClient = new DynamoDB.DocumentClient();
    }

    return this._dbClient;
  }

  async getById(table: any, id: any) {
    return this.dbClient.get({ TableName: table, Key: { id } }).promise();
  }

  async query(table: string, attrs: any, index?: string) {
    const params = {
      TableName: table,
      IndexName: index ? index : undefined,
      KeyConditionExpression: {},
      ExpressionAttributeValues: {},
    } as QueryInput;

    return this.dbClient.query(params).promise();
  }

  async scan(
    table: any,
    attrs?: any,
    filterExpression?: any,
    expressionAttributeNames?: any,
    expressionAttributeValues?: any
  ) {
    const params = {
      TableName: table,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    if (!params.FilterExpression && attrs) {
      const { expression, expressionValues } = this.mapAttrToParams(attrs);
      params.FilterExpression = expression;
      params.ExpressionAttributeValues = expressionValues;
    }
    const prom = await this.dbClient.scan(params).promise();
    return prom;
  }

  async insert(table: any, input: any) {
    const { id, ...data } = input;
    const item = { id: id || uuidv1(), ...data };
    return new Promise((resolve, reject) => {
      return this.dbClient.put({ TableName: table, Item: item }, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(item);
      });
    });
  }

  async update(table, data) {
    const { id, ...rest } = data;
    const keys = Object.keys(rest);

    const params = {
      TableName: table,
      Key: { id },
      UpdateExpression: `SET ${keys
        .map((key) => `${key} = :${key}`)
        .join(", ")}`,
      ExpressionAttributeValues: keys.reduce(
        (res, key) => ((res[`:${key}`] = rest[key] || null), res),
        {}
      ),
      ReturnValues: "UPDATED_NEW",
    };

    return new Promise((resolve, reject) => {
      return this.dbClient.update(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve({ id, ...data.Attributes });
      });
    });
  }

  async delete(table, id) {
    const params = {
      TableName: table,
      Key: { id },
      ReturnValues: "ALL_OLD",
    };

    return new Promise((resolve, reject) => {
      return this.dbClient.delete(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve({ ...data.Attributes });
      });
    });
  }

  mapAttrToParams(attrs) {
    const keys = Object.keys(attrs || {});
    const expression: string[] = [];
    const expressionValues = {};

    keys.forEach((k) => {
      const value = attrs[k];
      if (Array.isArray(value)) {
        expression.push(`${k} IN (${value.map((_, idx) => `:${k}${idx}`)})`);
        value.forEach((val, idx) => (expressionValues[`:${k}${idx}`] = val));
      } else {
        expression.push(`${k} = :${k}`);
        expressionValues[`:${k}`] = value;
      }
    });

    return { expression: expression.join(", "), expressionValues };
  }
}

export default DynamoDb;
