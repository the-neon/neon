/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// API CLIENT
// listDashboardsCall(...params) = framents => {

import { mkdirSync, writeFileSync } from "fs";
import { existsSync } from "fs";
import path from "path";
import { ErrorPrefix } from "@the-neon/core";

class GraphQlApiClientGenerator {
  // tabstop
  private static ts = "  ";

  private static readonly GQL_CLIENT = `
import { API } from "aws-amplify";
import gql from "graphql-tag";

export const ErrorPrefix = {
  ${Object.keys(ErrorPrefix)
    .map((key) => `${key}: '${ErrorPrefix[key]}',`)
    .join("\n")}
};

export const apiCall = async ({ query, variables, fragments }) => {
  let fragmentStr = '';
  if (fragments) {
    fragmentStr = Object.keys(fragments).reduce((agg, val) => {
      agg += (val + ' {\\n' + fragments[val].join('\\n') + '\\n}');
      return agg;
    }, '');
  }

  try {
    const response = await API.graphql({ query: gql\`\${query.replace('...fragments', fragmentStr)}\`, variables });
    return { success: true, data: Object.values(response.data)[0] };
  } catch (e) {
    if (!e.errors) {
      return { success: false, message: 'Unknown error' };
    }

    const errors = e.errors.map(({ extensions, message }) => ({
      message,
      inputs: extensions.inputs,
    }));

    if (errors.length === 1 && errors[0].inputs.length === 1 && !errors[0].inputs[0].field) {
      return { success: false, message: errors[0].inputs[0].message };
    }
    return { success: false, errors };
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

    if (query.params?.length > 0) {
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
    const respDef = GraphQlApiClientGenerator.createReqFields(query, types);

    const queryName = query.methodName.toUpperCase() + "_QUERY";

    queryLines.push("");
    queryLines.push(`const ${queryName} = \``);
    queryLines.push(
      `${GraphQlApiClientGenerator.ts}${type} ${query.methodName}${paramsDef} {`
    );
    queryLines.push(
      `${GraphQlApiClientGenerator.ts}${GraphQlApiClientGenerator.ts}${query.methodName}${inParams} {`
    );
    queryLines.push(
      `${GraphQlApiClientGenerator.ts}${GraphQlApiClientGenerator.ts}${GraphQlApiClientGenerator.ts}${respDef}`
    );

    let fragmentsIn = "";
    let fragmentsOut = "";

    // TODO: check if fragments can be defined,; i.e. have compex type in response
    if (respDef) {
      queryLines.push(
        `${GraphQlApiClientGenerator.ts}${GraphQlApiClientGenerator.ts}${GraphQlApiClientGenerator.ts}...fragments`
      );
      fragmentsIn = "fragments = null";
      fragmentsOut = ", fragments ";
    }

    queryLines.push(
      `${GraphQlApiClientGenerator.ts}${GraphQlApiClientGenerator.ts}}`
    );
    queryLines.push(`${GraphQlApiClientGenerator.ts}}\`;`);
    queryLines.push("");

    queryLines.push(
      `export const ${query.methodName}ApiCall = async (${
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

    lines.push("import { apiCall } from './gqlClient';");
    lines.push("");

    for (const query of queries) {
      let api = apis.get(query.instance);
      if (!api) {
        api = lines.join("\n");
      }
      api += GraphQlApiClientGenerator.createClientMethods(
        query,
        "query",
        types
      );
      apis.set(query.instance, api);
    }

    for (const mutation of mutations) {
      let api = apis.get(mutation.instance);
      if (!api) {
        api = lines.join("\n");
      }
      api += GraphQlApiClientGenerator.createClientMethods(
        mutation,
        "mutation",
        types
      );
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
      writeFileSync(gqlClientPath, GraphQlApiClientGenerator.GQL_CLIENT);

      const clientApis = GraphQlApiClientGenerator.createClientApis(
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

export default GraphQlApiClientGenerator;
