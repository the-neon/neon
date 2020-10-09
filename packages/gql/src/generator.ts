/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "fs";
import path from "path";
import {
  SourceFile,
  Node,
  SyntaxKind,
  forEachChild,
  createSourceFile,
  ScriptTarget,
  ScriptKind,
} from "typescript";

import chalk from "chalk";

import { respolveConfig } from "./config";

enum BuiltinType {
  String = "String",
  Boolean = "Boolean",
  Float = "Float",
  Int = "Int",
  Date = "Date",
  DateTime = "DateTime",
  Json = "JSON",
}

interface TypeProp {
  name: string;
  type: string;
}

interface TypeInterface {
  name: string;
  props: TypeProp[];
}

const classes = new Map();
const queries: any[] = [];
const mutations: any[] = [];
const imports: any[] = [];
const enums: any[] = [];
const inter = new Map();
const typeInterfaces = new Map<string, TypeInterface>();

let currentInstance = "";

// const getQlTypeFromTsType = tstype => {
//   switch (tstype) {
//     case SyntaxKind.StringKeyword:
//       return 'String';
//     case SyntaxKind.BooleanKeyword:
//       return 'Boolean';
//     case SyntaxKind.ObjectKeyword:
//       return 'JSON';
//     case SyntaxKind.NumberKeyword:
//       return 'Int';

//     case SyntaxKind.AnyKeyword:
//     default:
//       return 'JSON';
//   }
// };

const camelize = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

const delint = (sourceFile: SourceFile) => {
  const delintNode = (node: Node) => {
    if (node.kind === SyntaxKind.ClassDeclaration) {
      const importName = node.parent["fileName"]
        .replace("src/", "")
        .replace(".ts", "");
      const instanceName = camelize(node["name"].escapedText);
      currentInstance = instanceName;
      classes.set(instanceName, {
        instanceName,
        className: node["name"].escapedText,
        importName,
        methods: false,
      });
    }

    const toCamelCase = (str) =>
      str
        .replace(/_/g, " ")
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
          return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        })
        .replace(/\s+/g, "");

    let auth: any[] = [];
    let decoratorName = "";

    if (node.decorators) {
      // support multiple
      node.decorators.forEach((dec: Node) => {
        let decName = "";
        if (dec["expression"].kind === SyntaxKind.CallExpression) {
          decName = dec["expression"].expression["escapedText"];
        } else {
          decName = dec["expression"]["escapedText"];
        }

        console.log("\t", chalk.green(node?.["name"]?.["escapedText"]));

        // Set Auth decorator to GQL
        if (decName === "Auth") {
          if (dec["expression"]["arguments"]) {
            let authRole = "";
            let entityName = "";
            for (const arg of dec["expression"]["arguments"]) {
              if (arg.elements && !entityName) {
                for (const element of arg["elements"]) {
                  // auth is array of objects
                  if (!element["text"]) {
                    // Auth([{entity,action}]) decorator usage
                    // Auth([{entity,actions:[]}]) decorator usage
                    const properties = element["properties"].reduce(
                      (result, prop) => {
                        if (prop.initializer.elements) {
                          result[
                            prop.name.escapedText
                          ] = prop.initializer.elements.map(
                            (x) => x.name.escapedText
                          );
                        } else {
                          result[prop.name.escapedText] =
                            prop.initializer.name.escapedText;
                        }
                        return result;
                      },
                      {}
                    );

                    const actions = properties.action || properties.actions;
                    if (Array.isArray(actions)) {
                      actions.forEach((action) =>
                        auth.push(`${properties.entity}-${action}`)
                      );
                    } else {
                      auth.push(`${properties.entity}-${properties.action}`);
                    }
                  } else if (!auth[element["text"]]) {
                    // Auth(['permission']) decorator usage
                    auth.push(element["text"]);
                  }
                }
              } else {
                if (arg.elements) {
                  arg.elements.forEach((elem) => {
                    auth.push(`${entityName}-${elem.name.escapedText}`);
                  });
                  authRole = "";
                } else {
                  entityName = `-${arg.name.escapedText}`;
                  // Auth(entity,action) decorator usage
                  authRole += `-${arg.name.escapedText}`;
                }
              }
            }
            authRole && auth.push(`${authRole}`);
          }
        } else if (
          ["Get", "Post", "Put", "Patch", "Delete"].includes(decName)
        ) {
          decoratorName = decName;
        }
      });

      const methodName = node["name"].escapedText;
      let responseType;

      if (!node["type"] || !node["type"].typeArguments) {
        responseType = "JSON";
      } else if (node["type"].typeArguments[0].kind === SyntaxKind.TupleType) {
        responseType = `[${node["type"].typeArguments[0].elementTypes[0].typeName.escapedText}]`;
      } else if (node["type"].typeArguments[0].kind === SyntaxKind.ArrayType) {
        responseType = `[${node["type"].typeArguments[0].elementType.typeName.escapedText}]`;
      } else if (node["type"].typeArguments[0].kind === SyntaxKind.AnyKeyword) {
        responseType = "JSON";
      } else {
        try {
          responseType = node["type"].typeArguments[0].typeName.escapedText;
        } catch (ex) {
          console.log(ex.message);
          console.log(node["type"]);
        }
      }

      const params: any[] = [];

      // has params
      if (
        node["parameters"] &&
        node["parameters"].end > node["parameters"].pos
      ) {
        node["parameters"].forEach((param) => {
          const paramName = param.name.escapedText;
          let paramType = "";
          const scalar = true;

          if (param.decorators) {
            for (const decorator of param.decorators) {
              if (decorator["expression"]["escapedText"] === "key") {
                paramType = "ID";
              }
            }
          }

          if (!paramType) {
            try {
              if (!param.type) {
                paramType = "JSON";
              } else if (param.type.kind === SyntaxKind.ArrayType) {
                if (param["type"].elementType.kind === SyntaxKind.AnyKeyword) {
                  paramType = BuiltinType.Json;
                } else if (
                  param["type"].elementType.typeName.escapedText === "integer"
                ) {
                  paramType = `[${BuiltinType.Int}]`;
                } else if (
                  param["type"].elementType.typeName.escapedText === "float"
                ) {
                  paramType = `[${BuiltinType.Float}]`;
                } else {
                  paramType = `[${param["type"].elementType.typeName.escapedText}]`;
                }
              } else if (param.type.kind === SyntaxKind.AnyKeyword) {
                paramType = BuiltinType.Json;
              } else if (param.type.kind === SyntaxKind.BooleanKeyword) {
                paramType = BuiltinType.Boolean;
              } else if (param.type.kind === SyntaxKind.StringKeyword) {
                paramType = BuiltinType.String;
              } else if (param.type.kind === SyntaxKind.NumberKeyword) {
                paramType = BuiltinType.Float;
              }

              // temp fix
              else if (
                param.type &&
                param.type.typeName &&
                param.type.typeName.escapedText
              ) {
                if (param.type.typeName.escapedText === "integer") {
                  paramType = BuiltinType.Int;
                } else if (param.type.typeName.escapedText === "float") {
                  paramType = BuiltinType.Float;
                } else if (
                  param.type.typeName.escapedText.toLowerCase() === "date"
                ) {
                  paramType = BuiltinType.DateTime;
                }
              }
              // temp fix - end
              else if (param.type.kind === SyntaxKind.TypeReference) {
                const typeName = param.type.typeName.escapedText;
                if (typeName === "Date") {
                  paramType = BuiltinType.DateTime;
                } else {
                  paramType = typeName;
                }
              } else {
                const typeName = param.type.typeName.escapedText;
                switch (typeName) {
                  case "integer":
                    paramType = BuiltinType.Int;
                    break;
                  case "float":
                    paramType = BuiltinType.Float;
                    break;
                  default:
                    console.log("Defaluting type to JSON, ", param.type.kind);
                    paramType = BuiltinType.Json;
                    break;
                }
              }
            } catch (ex) {
              console.log(ex.message);
              console.log(param.type);
            }
          }

          params.push({
            paramName,
            paramType,
            optional: !!param.questionToken,
            scalar,
          });
        });
      }

      let doc = "";
      if (node["jsDoc"]) {
        doc = `""" ${node["jsDoc"][0].comment} """`;
      }

      auth = auth.map((x) => {
        const [entity, action] = x.split("-").filter((x) => x);
        return {
          entity: toCamelCase(entity),
          action,
        };
      });
      auth.length &&
        (auth = [`"${Buffer.from(JSON.stringify(auth)).toString("base64")}"`]);
      const item = {
        instance: currentInstance,
        methodName,
        params,
        responseType,
        doc,
        auth,
      };
      switch (decoratorName) {
        case "Post":
        case "Put":
        case "Patch":
        case "Delete":
          classes.set(currentInstance, {
            ...classes.get(currentInstance),
            methods: true,
          });
          mutations.push(item);
          break;

        case "Get":
          classes.set(currentInstance, {
            ...classes.get(currentInstance),
            methods: true,
          });
          queries.push(item);
          break;

        case "Auth":
          // const classA = classes.get(currentInstance);
          break;

        default:
          break;
      }
    }
    switch (node.kind) {
      case SyntaxKind.EnumDeclaration:
        enums.push({
          name: node["name"].escapedText,
          members: node["members"].map(
            (element) => element.initializer.text || element.name.escapedText
          ),
        });
        break;

      case SyntaxKind.InterfaceDeclaration: {
        const iface: {
          kind: any;
          name: any;
          members: any[];
          implements?: any;
        } = {
          kind: null,
          name: node["name"].escapedText,
          members: [],
        };

        if (node["heritageClauses"]) {
          for (const clause of node["heritageClauses"]) {
            const name = clause.types[0].expression.escapedText;
            const typeIface = typeInterfaces.get(name);
            const typeModel = inter.get(name);

            // move from Type to Interface
            if (!typeIface && typeModel) {
              typeInterfaces.set(name, {
                name,
                props: typeModel.members.map((mem) => ({
                  name: mem.name,
                  type: mem.typeName,
                })),
              });
              inter.delete(name);
            }
            iface.implements = name;
            break;
          }
        }

        node["members"].forEach((element) => {
          const member: {
            name: string;
            optional: boolean;
            scalar: boolean;
            typeName?: string;
          } = {
            name: element.name.escapedText,
            optional: !!element["questionToken"],
            scalar: true,
          };

          // TODO: move to map method
          switch (element.type.kind) {
            case SyntaxKind.BooleanKeyword:
              member.typeName = BuiltinType.Boolean;
              break;

            case SyntaxKind.StringKeyword:
              member.typeName = BuiltinType.String;
              break;

            case SyntaxKind.NumberKeyword: {
              const typeName = element.type.typeName
                ? element.type.typeName.escapedText
                : "";
              switch (typeName) {
                case "integer":
                  member.typeName = "Int";
                  break;
                case "float":
                default:
                  member.typeName = "Float";
                  break;
              }

              break;
            }

            case SyntaxKind.TypeReference: {
              if (element.type.typeName.escapedText === "Date") {
                member.typeName = "DateTime";
              } else if (element.type.typeName.escapedText === "Array") {
                member.typeName = "JSON";
              } else {
                switch (element.type.typeName.escapedText) {
                  case "integer":
                    member.typeName = "Int";
                    break;
                  case "float":
                    member.typeName = "Float";
                    break;
                  default:
                    member.typeName = element.type.typeName.escapedText;
                    member.scalar = false;
                    break;
                }
              }

              break;
            }
            case SyntaxKind.ArrayType: {
              try {
                member.scalar = false;
                member.typeName = `[${element.type.elementType.typeName.escapedText}]`;
              } catch (ex) {
                member.typeName = "JSON";
              }
              break;
            }
            case SyntaxKind.TupleType: {
              try {
                console.error("warning: TupleType!");
                member.typeName = `[${element.type.elementTypes[0].typeName.escapedText}]`;
              } catch (ex) {
                member.typeName = "JSON";
              }
              break;
            }
            case SyntaxKind.TypeLiteral: {
              member.typeName = "JSON";
              break;
            }

            case SyntaxKind.AnyKeyword: {
              member.typeName = "JSON";
              break;
            }

            default: {
              member.typeName = "JSON";
              console.info(
                `No mapping implementation for node of king '${element.type.kind}', defaulting to 'JSON'`
              );
              break;
            }
          }

          iface.members.push(member);
        });

        inter.set(iface.name, iface);
        break;
      }
    }

    forEachChild(node, delintNode);
  };

  delintNode(sourceFile);
};

const config = respolveConfig();

config.inputDirs.forEach((directory) => {
  console.log("🔨 Parsing", directory);
  // Parse a file

  const files = readdirSync(directory);

  files.forEach((file) => {
    if (file.endsWith(".ts")) {
      console.log(chalk.cyan(file));
      const fileName = path.join(directory, file);
      const sourceFile = createSourceFile(
        fileName,
        readFileSync(fileName).toString(),
        ScriptTarget.ESNext,
        /*setParentNodes */ true,
        ScriptKind.TS
      );

      // delint it
      delint(sourceFile);
    }
  });
});

const createInputs = (functions: any[]) => {
  functions.forEach((f) => {
    f.params.forEach((param) => {
      const cleanParam = param.paramType.replace(/^\[/, "").replace(/\]$/, "");
      const ifcp = inter.get(cleanParam);
      if (ifcp) {
        ifcp.kind = "input";

        for (const memeber of ifcp.members) {
          if (!memeber.scalar) {
            const realType = memeber.typeName
              .replace(/^\[/, "")
              .replace(/\]$/, "");
            const ifmem = inter.get(realType);
            if (ifmem) {
              ifmem.kind = "input";
            }
          }
        }
      }
      inter.set(cleanParam, ifcp);
    });
  });
};

createInputs(queries);
createInputs(mutations);

imports.push(`import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import GraphQLJSON from 'graphql-type-json'
import { DataSource } from 'apollo-datasource';
`);

classes.forEach((cls) => {
  if (cls.methods) {
    imports.push(`import ${cls.className} from '../../${cls.importName}';`);
  }
});

const lines: string[] = [];

lines.push("/* eslint-disable max-len */");
imports.forEach((imp) => lines.push(imp));
lines.push(`

class GqlDataSource extends DataSource {
  private apiType: any;
  private instance: any;
  private appContext: any;

  constructor(apiType) {
    super();
    this.apiType = apiType;
  }

  initialize?(config) {
    this.appContext = config?.context?.appContext;
  }

  call(method, ...args) {
    if (!this.instance) {
      this.instance = new this.apiType(this.appContext);
    }
    return this.instance?.[method](...args);
  }
}

`);
lines.push(`export const APISources = {`);

let tbs = "  ";
classes.forEach((cls) => {
  if (cls.methods) {
    lines.push(
      `${tbs}${cls.instanceName}: new GqlDataSource(${cls.className}),`
    );
  }
});
lines.push("");
lines.push(`};`);

tbs = "";
lines.push(`${tbs}export const resolvers = {`);

tbs = "  ";
lines.push(`${tbs}Query: {`);
tbs = "    ";

queries.forEach((q) => {
  const prms = q.params.map((p) => p.paramName);
  lines.push(
    `${tbs}${q.methodName}: (_, { ${prms.join(
      ", "
    )} }, { dataSources }) => dataSources.${q.instance}.call('${
      q.methodName
    }', ${prms.join(", ")}),`
  );
});

tbs = "  ";
lines.push(`${tbs}},`);
lines.push(`${tbs}Mutation: {`);
tbs = "    ";

mutations.forEach((q) => {
  const prms = q.params.map((p) => p.paramName);
  lines.push(
    `${tbs}${q.methodName}: (_, { ${prms.join(
      ", "
    )} }, { dataSources }) => dataSources.${q.instance}.call('${
      q.methodName
    }', ${prms.join(", ")}),`
  );
});

tbs = "";
lines.push(`${tbs}},`);

lines.push(`
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
};
`);

const schema: string[] = [];

schema.push(`
import { gql } from 'apollo-server-lambda';

export const typeDefs = gql\`
directive @auth(roles: String) on FIELD_DEFINITION

scalar JSON
scalar Date
scalar DateTime
`);

enums.forEach((en) => {
  schema.push(`${tbs}enum ${en.name} {`);

  tbs += "  ";
  en.members.forEach((member) => {
    schema.push(`${tbs}${member}`);
  });

  tbs = "";
  schema.push(`${tbs}}\n`);
});

typeInterfaces.forEach((iface) => {
  schema.push(`interface ${iface.name} {`);
  tbs = "  ";

  iface.props.forEach((prop) => {
    schema.push(`${tbs}${prop.name}: ${prop.type}`);
  });

  schema.push(`}`);
  tbs = "";
});

inter.forEach((ifc) => {
  if (!ifc) {
    return;
  }

  schema.push(
    `${tbs}${ifc.kind || "type"} ${ifc.name}${
      ifc.implements ? " implements " + ifc.implements : ""
    } {`
  );
  tbs = "  ";

  ifc.members.forEach((member) => {
    schema.push(
      `${tbs}${member.name}: ${member.typeName}${member.optional ? "" : "!"}`
    );
  });
  tbs = "";
  schema.push(`${tbs}}\n`);
});

schema.push(`${tbs}type Query {`);
tbs = "  ";
queries.forEach((q) => {
  schema.push(`${tbs}${q.doc}`);
  let params = "";
  if (q.params && q.params.length > 0) {
    const paramsarr = q.params.map(
      (p) => `${p.paramName}: ${p.paramType}${p.optional ? "" : "!"}`
    );
    params = `(${paramsarr.join(", ")})`;
  }
  let extra = "";
  if (q.auth && q.auth.length > 0) {
    extra = ` @auth(roles: [${q.auth.join(",")}])`;
  }

  schema.push(`${tbs}${q.methodName}${params}: ${q.responseType}${extra}`);
});

tbs = "";
schema.push(`${tbs}}`);
schema.push("");
schema.push(`${tbs}type Mutation {`);
tbs = "  ";

mutations.forEach((q) => {
  schema.push(`${tbs}${q.doc}`);
  let params = "";
  if (q.params && q.params.length > 0) {
    const paramsarr = q.params.map(
      (p) => `${p.paramName}: ${p.paramType}${p.optional ? "" : "!"}`
    );
    params = `(${paramsarr.join(", ")})`;
  }
  let extra = "";
  if (q.auth && q.auth.length > 0) {
    extra = ` @auth(roles: [${q.auth.join(",")}])`;
  }
  schema.push(`${tbs}${q.methodName}${params}: ${q.responseType}${extra}`);
});

tbs = "";
schema.push(`${tbs}}\n`);
schema.push("`;");

const genpath = path.resolve(config.outDir);
if (!existsSync(genpath)) {
  mkdirSync(genpath);
}

const schemapath = path.resolve(genpath, "schema.ts");
const resolverspath = path.resolve(genpath, "resolvers.ts");

writeFileSync(schemapath, schema.join("\n"));
writeFileSync(resolverspath, lines.join("\n"));
