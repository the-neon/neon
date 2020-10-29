import { SyntaxKind } from "typescript";

enum BuiltinType {
  String = "String",
  Boolean = "Boolean",
  Float = "Float",
  Int = "Int",
  Date = "Date",
  DateTime = "DateTime",
  Json = "JSON",
}

class Mapper {
  public static mapType(type: any): string {
    let paramType = "";
    try {
      if (!type) {
        paramType = "JSON";
      } else if (type.kind === SyntaxKind.ArrayType) {
        if (type.elementType.kind === SyntaxKind.AnyKeyword) {
          paramType = BuiltinType.Json;
        } else if (type?.elementType?.typeName?.escapedText === "integer") {
          paramType = `[${BuiltinType.Int}]`;
        } else if (type?.elementType?.typeName?.escapedText === "float") {
          paramType = `[${BuiltinType.Float}]`;
        } else if (type?.elementType?.typeName?.escapedText) {
          paramType = `[${type.elementType.typeName.escapedText}]`;
        } else {
          // map recursively
          paramType = `[${Mapper.mapType(type.elementType)}]`;
        }
      } else if (type.kind === SyntaxKind.AnyKeyword) {
        paramType = BuiltinType.Json;
      } else if (type.kind === SyntaxKind.BooleanKeyword) {
        paramType = BuiltinType.Boolean;
      } else if (type.kind === SyntaxKind.StringKeyword) {
        paramType = BuiltinType.String;
      } else if (type.kind === SyntaxKind.NumberKeyword) {
        paramType = BuiltinType.Float;
      } else {
        const typeName = type.typeName.escapedText;
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
            paramType = typeName || BuiltinType.Json;
            console.log("Defaluting type to JSON, ", type.kind);
            break;
        }
      }
    } catch (ex) {
      console.log(ex.message);
    }
    return paramType;
  }
}

export default Mapper;
export { BuiltinType };
