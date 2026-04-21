import { SyntaxKind } from "typescript";
import Mapper from "./Mapper";

function makeTypeNode(
  kind: SyntaxKind,
  typeName?: string,
  elementKind?: SyntaxKind,
): any {
  if (kind === SyntaxKind.ArrayType) {
    return {
      kind: SyntaxKind.ArrayType,
      elementType: elementKind
        ? { kind: elementKind, typeName: { escapedText: typeName } }
        : { kind: typeName as any, typeName: { escapedText: typeName } },
    };
  }
  return {
    kind,
    typeName: typeName ? { escapedText: typeName } : undefined,
  };
}

describe("Mapper", () => {
  describe("mapType", () => {
    it("null type returns JSON", () => {
      expect(Mapper.mapType(null)).toBe("JSON");
    });

    it("undefined type returns JSON", () => {
      expect(Mapper.mapType(undefined)).toBe("JSON");
    });

    it("AnyKeyword returns JSON", () => {
      expect(Mapper.mapType(makeTypeNode(SyntaxKind.AnyKeyword))).toBe("JSON");
    });

    it("BooleanKeyword returns Boolean", () => {
      expect(Mapper.mapType(makeTypeNode(SyntaxKind.BooleanKeyword))).toBe(
        "Boolean",
      );
    });

    it("StringKeyword returns String", () => {
      expect(Mapper.mapType(makeTypeNode(SyntaxKind.StringKeyword))).toBe(
        "String",
      );
    });

    it("NumberKeyword returns Float", () => {
      expect(Mapper.mapType(makeTypeNode(SyntaxKind.NumberKeyword))).toBe(
        "Float",
      );
    });

    it("TypeReference to Date returns DateTime", () => {
      expect(
        Mapper.mapType(makeTypeNode(SyntaxKind.TypeReference, "Date")),
      ).toBe("DateTime");
    });

    it("TypeReference to integer returns Int", () => {
      expect(
        Mapper.mapType(makeTypeNode(SyntaxKind.TypeReference, "integer")),
      ).toBe("Int");
    });

    it("TypeReference to long returns Long", () => {
      expect(
        Mapper.mapType(makeTypeNode(SyntaxKind.TypeReference, "long")),
      ).toBe("Long");
    });

    it("TypeReference to float returns Float", () => {
      expect(
        Mapper.mapType(makeTypeNode(SyntaxKind.TypeReference, "float")),
      ).toBe("Float");
    });

    it("TypeReference to unknown type returns that type name", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      expect(
        Mapper.mapType(makeTypeNode(SyntaxKind.TypeReference, "SomeType")),
      ).toBe("SomeType");
      consoleSpy.mockRestore();
    });

    it("ArrayType with integer element returns [Int]", () => {
      expect(
        Mapper.mapType(
          makeTypeNode(
            SyntaxKind.ArrayType,
            "integer",
            SyntaxKind.TypeReference,
          ),
        ),
      ).toBe("[Int]");
    });

    it("ArrayType with long element returns [Long]", () => {
      expect(
        Mapper.mapType(
          makeTypeNode(SyntaxKind.ArrayType, "long", SyntaxKind.TypeReference),
        ),
      ).toBe("[Long]");
    });

    it("ArrayType with float element returns [Float]", () => {
      expect(
        Mapper.mapType(
          makeTypeNode(SyntaxKind.ArrayType, "float", SyntaxKind.TypeReference),
        ),
      ).toBe("[Float]");
    });

    it("ArrayType with user-defined type returns [TypeName]", () => {
      expect(
        Mapper.mapType(
          makeTypeNode(SyntaxKind.ArrayType, "User", SyntaxKind.TypeReference),
        ),
      ).toBe("[User]");
    });

    it("ArrayType with nested array returns [[String]]", () => {
      const outer = makeTypeNode(SyntaxKind.ArrayType);
      const inner = makeTypeNode(
        SyntaxKind.ArrayType,
        "String",
        SyntaxKind.StringKeyword,
      );
      outer.elementType = inner;
      expect(Mapper.mapType(outer)).toBe("[[String]]");
    });

    it("exception during mapping returns empty string", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      expect(Mapper.mapType({ kind: 99999 })).toBe("");
      consoleSpy.mockRestore();
    });
  });
});
