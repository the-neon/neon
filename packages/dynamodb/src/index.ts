import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v1 as uuidv1 } from "uuid";

class DynamoDb {
  private _dbClient: DynamoDBDocumentClient | null = null;

  private get dbClient(): DynamoDBDocumentClient {
    if (!this._dbClient) {
      const client = new DynamoDBClient({});
      this._dbClient = DynamoDBDocumentClient.from(client);
    }

    return this._dbClient;
  }

  async getById(table: any, id: any) {
    const result = await this.dbClient.send(
      new GetCommand({ TableName: table, Key: { id } }),
    );
    return result;
  }

  async query(table: string, attrs: any, index?: string) {
    const params: QueryCommand["input"] = {
      TableName: table,
      IndexName: index,
    };

    return this.dbClient.send(new QueryCommand(params));
  }

  async scan(
    table: any,
    attrs?: any,
    filterExpression?: any,
    expressionAttributeNames?: any,
    expressionAttributeValues?: any,
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
    return this.dbClient.send(new ScanCommand(params));
  }

  async insert(table: any, input: any) {
    const { id, ...data } = input;
    const item = { id: id || uuidv1(), ...data };
    await this.dbClient.send(new PutCommand({ TableName: table, Item: item }));
    return item;
  }

  async update(table: any, data: any) {
    const { id, ...rest } = data;
    const keys = Object.keys(rest);

    const params: UpdateCommand["input"] = {
      TableName: table,
      Key: { id },
      UpdateExpression: `SET ${keys
        .map((key) => `${key} = :${key}`)
        .join(", ")}`,
      ExpressionAttributeValues: keys.reduce(
        (res, key) => ((res[`:${key}`] = rest[key] || null), res),
        {},
      ),
      ReturnValues: "UPDATED_NEW",
    };

    const result = await this.dbClient.send(new UpdateCommand(params));
    return { id, ...result.Attributes };
  }

  async delete(table: any, id: any) {
    const params: DeleteCommand["input"] = {
      TableName: table,
      Key: { id },
      ReturnValues: "ALL_OLD",
    };

    const result = await this.dbClient.send(new DeleteCommand(params));
    return { ...result.Attributes };
  }

  mapAttrToParams(attrs: any) {
    const keys = Object.keys(attrs || {});
    const expression: string[] = [];
    const expressionValues: any = {};

    keys.forEach((k) => {
      const value = attrs[k];
      if (Array.isArray(value)) {
        expression.push(
          `${k} IN (${value.map((_: any, idx: number) => `:${k}${idx}`)})`,
        );
        value.forEach(
          (val: any, idx: number) => (expressionValues[`:${k}${idx}`] = val),
        );
      } else {
        expression.push(`${k} = :${k}`);
        expressionValues[`:${k}`] = value;
      }
    });

    return { expression: expression.join(", "), expressionValues };
  }
}

export default DynamoDb;
