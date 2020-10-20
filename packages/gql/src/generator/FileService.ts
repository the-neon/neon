// API CLIENT
// listDashboardsCall(...params) = framents => {

import { mkdirSync, writeFileSync } from "fs";
import { existsSync } from "fs";
import path from "path";

//   const defSelector = `id
//   name
//   definition`

//     `query listDashboards(@tenantId, @userId) {
//       ${defSelector}
//       ${selector}
//   }
//   `, params)
// }

// API CLIENT

// CONSTEXT

// gql`
//     fragment CommentsPageComment on Comment {
//       id
//       postedBy {
//         login
//         html_url
//       }
//       createdAt
//       content
//     }
//   `

// const fragmnet = `thenaht {
//   owner {
//     id
//     name
//     address
//   }
//   location {
//     lat
//   }
// }, `

// listDashboards(tenantId , x)(framents)

class FileService {
  static createClientApis(
    schema: string[],
    resolvers: string[]
  ): { api: string; methods: string[] }[] {
    console.log(schema, resolvers);
    return [{ api: "user", methods: ["dasda"] }];
  }

  static createSchemma(classes: string[], resolvers: string[]): string[] {
    console.log(classes, resolvers);
    return ["", ""];
  }

  static createResolvers(
    classes: { methods: string; className: string; importName: string }[],
    resolvers: string[]
  ): string[] {
    console.log(classes, resolvers);
    const imports: string[] = [];
    imports.push(`import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
      import GraphQLJSON from 'graphql-type-json'
      import { DataSource } from 'apollo-datasource';
      `);

    classes.forEach((cls) => {
      if (cls.methods) {
        imports.push(`import ${cls.className} from '../../${cls.importName}';`);
      }
    });
    return imports;
  }

  static generateFiles(
    queries: string[],
    types: string[],
    gqlPath: string,
    clientPath?: string
  ): void {
    const genpath = path.resolve(gqlPath);
    if (!existsSync(genpath)) {
      mkdirSync(genpath);
    }

    const schema = FileService.createSchemma(queries, types);
    const resolvers = FileService.createResolvers(queries, types);
    const schemaPath = path.resolve(genpath, "schema.ts");
    const resolversPath = path.resolve(genpath, "resolvers.ts");
    writeFileSync(schemaPath, schema.join("\n"));
    writeFileSync(resolversPath, resolvers.join("\n"));

    if (clientPath) {
      const apipath = path.resolve(clientPath);
      if (!existsSync(apipath)) {
        mkdirSync(apipath);
      }

      const clientApis = FileService.createClientApis(queries, types);
      for (const clientApi of clientApis) {
        const apiPath = path.resolve(apipath, `${clientApi.api}.ts`);
        writeFileSync(apiPath, schema.join("\n"));
      }
    }
  }
}

export default FileService;
