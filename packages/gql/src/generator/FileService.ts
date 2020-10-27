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

  private static readonly GQL_CLIENT = `
  import { API } from "aws-amplify";
  import gql from "graphql-tag";

  export const apiCall = ({ query, variables, fragment }) => {
    let fragmentStr = '';
    if (fragment) {
      fragmentStr = Object.keys(fragment).reduce((agg, val) => {
        agg += (val + ' {\\n' + fragment[val].join('\\n') + '\\n}');
        return agg;
      }, '');
    }

    try {
      const response = API.graphql({ query: gql\`\${query.replace('...fragments', fragmentStr)}\`, variables });
      return { success: true, data: Object.values(response.data)[0] };
    } catch (e) {
      return e.errors?.[0] || { success: false, message: 'Unknown error' };
    }
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

    let inParams = "";
    let paramsDef = "";

    if (query.params) {
      paramsDef = query.params
        .map((p) => `$${p.paramName}: ${p.paramType}${p.optional ? "" : "!"}`)
        .join(", ");
      inParams = query.params
        .map((p) => `${p.paramName}: $${p.paramName}`)
        .join(", ");
      paramsDef = `(${paramsDef})`;
      inParams = `(${inParams})`;
    }

    const funcParams = query.params.map((p) => `${p.paramName}`).join(", ");
    const respDef = FileService.createReqFields(query, types);

    const queryName = query.methodName.toUpperCase() + "_QUERY";

    queryLines.push("");
    queryLines.push(`const ${queryName} = \``);
    queryLines.push(
      `${FileService.ts}${type} ${query.methodName}${paramsDef} {`
    );
    queryLines.push(
      `${FileService.ts}${FileService.ts}${query.methodName}${inParams} {`
    );
    queryLines.push(
      `${FileService.ts}${FileService.ts}${FileService.ts}${respDef}`
    );

    let fragmentsIn = "";
    let fragmentsOut = "";

    // TODO: check if fragments can be defined,; i.e. have compex type in response
    if (respDef) {
      queryLines.push(
        `${FileService.ts}${FileService.ts}${FileService.ts}...fragments`
      );
      fragmentsIn = "fragments = null";
      fragmentsOut = ", fragments ";
    }

    queryLines.push(`${FileService.ts}${FileService.ts}}`);
    queryLines.push(`${FileService.ts}}\`;`);
    queryLines.push("");

    queryLines.push(
      `export const ${query.methodName} = async (${
        funcParams ? "{" + funcParams + "}, " : ""
      }${fragmentsIn}) => apiCall({ query: ${queryName}, variables: {${funcParams}}${fragmentsOut}});`
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

    lines.push("import { apiCall } from 'gqlClient';");
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
