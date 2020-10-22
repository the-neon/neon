/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// API CLIENT
// listDashboardsCall(...params) = framents => {

import { mkdirSync, writeFileSync } from "fs";
import { existsSync } from "fs";
import path from "path";

class FileService {
  // tabstop
  private static ts = "  ";

  private static readonly GQL_CLIENT = `const apiCall = ({ query, variables, fragment }) => {
    let fragmentStr = '';
    if (fragment) {
      fragmentStr = Object.keys(fragment).reduce((agg, val) => {
        agg += (val + ' {\n' + fragment[val].join('\n') + '\n}\n');
        return agg;
      }, '');
    }
    return API.graphql({ query: gql\`\${query.replace('...fragment', fragmentStr)}\`, variables, authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS });
  }
  `;

  static createReqFields(query, types) {
    const resp: string[] = [];
    if (query.responseType !== "JSON") {
      const type = types.get(
        query.responseType.replace("[", "").replace("]", "")
      );
      type?.members?.forEach((member) => {
        if (member.scalar) {
          resp.push(member.name);
        }
      });
    }
    return resp.join("\n\t\t\t");
  }

  private static createClientMethods(query, type, types) {
    const queryLines: string[] = [];
    const paramsDef = query.params
      .map((p) => `$${p.paramName}: ${p.paramType}${p.optional ? "" : "!"}`)
      .join(", ");
    const inParams = query.params
      .map((p) => `${p.paramName}: $${p.paramName}`)
      .join(", ");
    const funcParams = query.params.map((p) => `${p.paramName}`).join(", ");
    const respDef = FileService.createReqFields(query, types);

    /*
const LIST_TENANTS_QUERY = `
  query listTenants {
    listTenants {
      id
      name
      email
      address
      phone
      website
      ...fragment
    }
  }`;

export const fetchAllTenants = async (fragment) => apiCall({ query: LIST_TENANTS_QUERY, fragment });

    */

    const queryName = query.methodName.toUpperCase() + "_QUERY";

    queryLines.push("");
    queryLines.push(`const ${queryName} = gql\``);
    queryLines.push(
      `${FileService.ts}${type} ${query.methodName}(${paramsDef}) {`
    );
    queryLines.push(
      `${FileService.ts}${FileService.ts}${query.methodName}(${inParams}) {`
    );
    queryLines.push(
      `${FileService.ts}${FileService.ts}${FileService.ts}${respDef}`
    );
    queryLines.push(`${FileService.ts}${FileService.ts}}`);
    queryLines.push(`${FileService.ts}}\`;`);
    queryLines.push("");
    //               export const ddddfetchAllTenants = async (fragment) => apiCall({ query: LIST_TENANTS_QUERY, fragment });
    queryLines.push(
      `export const ${query.methodName} = async (${
        funcParams ? "{" + funcParams + "}, " : ""
      }fragments = null) => apiCall({ query: ${queryName}, variables: {${funcParams}} ,fragment });`
    );
    queryLines.push("");

    return queryLines.join("\n");
  }

  static createClientApis(
    queries: any[],
    mutations: any[],
    types
  ): Map<string, string> {
    const apis: Map<string, string> = new Map();

    const lines: string[] = [];
    lines.push("import { API, graphqlOperation } from 'aws-amplify';");
    lines.push("import gql from 'graphql-tag';");
    lines.push("");

    for (const query of queries) {
      let api = apis.get(query.instance);
      if (!api) {
        api = lines.join("\n");
      }
      api += FileService.createClientMethods(query, "query", types);
      apis.set(query.instance, api);
    }

    for (const mutation of mutations) {
      let api = apis.get(mutation.instance);
      if (!api) {
        api = lines.join("\n");
      }
      api += FileService.createClientMethods(mutation, "mutation", types);
      apis.set(mutation.instance, api);
    }

    return apis;
  }

  static generateFiles(
    queries: unknown[],
    mutations: unknown[],
    types: Map<string, unknown>,
    gqlPath: string,
    clientPath?: string
  ): void {
    // const genpath = path.resolve(gqlPath);
    // if (!existsSync(genpath)) {
    //   mkdirSync(genpath);
    // }

    if (clientPath) {
      const apipath = path.resolve(clientPath);
      if (!existsSync(apipath)) {
        mkdirSync(apipath);
      }

      const gqlClientPath = path.resolve(apipath, `gqlClient.js`);
      writeFileSync(gqlClientPath, FileService.GQL_CLIENT);

      const clientApis = FileService.createClientApis(
        queries,
        mutations,
        types
      );
      clientApis.forEach((val, k) => {
        const apiPath = path.resolve(apipath, `${k}.js`);
        writeFileSync(apiPath, val);
      });
    }
  }
}

export default FileService;
