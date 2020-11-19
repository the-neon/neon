/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { SourceFile, Node, SyntaxKind, forEachChild } from "typescript";

import chalk from "chalk";
import Mapper from "./Mapper";

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

const camelize = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

class Delinter {
  _classes = new Map();
  _types = new Map();

  typeInterfaces = new Map<string, TypeInterface>();

  queries: any[] = [];
  mutations: any[] = [];
  enums: any[] = [];

  private currentInstance = "";

  // private _types: any;

  delint(sourceFile: SourceFile) {
    const delintNode = (node: Node) => {
      if (node.kind === SyntaxKind.ClassDeclaration) {
        const importName = node.parent["fileName"]
          .replace("src/", "")
          .replace(".ts", "");
        const instanceName = camelize(node["name"].escapedText);
        this.currentInstance = instanceName;
        this._classes.set(instanceName, {
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
        const responseType = Mapper.mapType(node["type"].typeArguments[0]);

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
              paramType = Mapper.mapType(param);
              try {
                if (!param.type) {
                  paramType = "JSON";
                } else if (param.type.kind === SyntaxKind.ArrayType) {
                  if (
                    param["type"].elementType.kind === SyntaxKind.AnyKeyword
                  ) {
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
                } else {
                  const typeName = param.type.typeName.escapedText;
                  switch (typeName) {
                    case "Date":
                      paramType = BuiltinType.DateTime;
                      break;
                    case "integer":
                      paramType = BuiltinType.Int;
                      break;
                    case "float":
                      paramType = BuiltinType.Float;
                      break;
                    default:
                      console.log(
                        "Defaulting type to JSON, ",
                        param.type.kind,
                        typeName
                      );
                      paramType = typeName || BuiltinType.Json;
                      console.log("Defaluting type to JSON, ", param.type.kind);
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
          (auth = [
            `"${Buffer.from(JSON.stringify(auth)).toString("base64")}"`,
          ]);
        const item = {
          instance: this.currentInstance,
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
            this._classes.set(this.currentInstance, {
              ...this._classes.get(this.currentInstance),
              methods: true,
            });
            this.mutations.push(item);
            break;

          case "Get":
            this._classes.set(this.currentInstance, {
              ...this._classes.get(this.currentInstance),
              methods: true,
            });
            this.queries.push(item);
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
          this.enums.push({
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
              const typeIface = this.typeInterfaces.get(name);
              const typeModel = this._types.get(name);

              // move from Type to Interface
              if (!typeIface && typeModel) {
                this.typeInterfaces.set(name, {
                  name,
                  props: typeModel.members.map((mem) => ({
                    name: mem.name,
                    type: mem.typeName,
                  })),
                });
                this._types.delete(name);
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
                  if (
                    element.type.elementType.typeName.escapedText === "integer"
                  ) {
                    member.typeName = "[Int]";
                    member.scalar = true;
                  } else if (
                    element.type.elementType.typeName.escapedText === "float"
                  ) {
                    member.typeName = "[Float]";
                    member.scalar = true;
                  } else {
                    member.typeName = `[${element.type.elementType.typeName.escapedText}]`;
                  }
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

          this._types.set(iface.name, iface);
          break;
        }
      }

      forEachChild(node, delintNode);
    };

    delintNode(sourceFile);
  }

  get classes() {
    return this._classes;
  }

  get types() {
    return this._types;
  }

  createInputs(functions: any[]) {
    functions.forEach((f) => {
      f.params.forEach((param) => {
        const cleanParam = param.paramType
          .replace(/^\[/, "")
          .replace(/\]$/, "");
        const ifcp = this._types.get(cleanParam);
        if (ifcp) {
          ifcp.kind = "input";

          for (const memeber of ifcp.members) {
            if (!memeber.scalar) {
              const realType = memeber.typeName
                .replace(/^\[/, "")
                .replace(/\]$/, "");
              const ifmem = this._types.get(realType);
              if (ifmem) {
                ifmem.kind = "input";
              }
            }
          }
        }
        this._types.set(cleanParam, ifcp);
      });
    });
  }
}

export default Delinter;
