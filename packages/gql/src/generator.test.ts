import { createSourceFile, ScriptKind, ScriptTarget } from "typescript";
import Delinter from "./generator/Delinter";

describe("schema generator", () => {
  let delinter: Delinter;

  beforeEach(() => {
    delinter = new Delinter();
  });

  it.todo("provide schema");

  it("should ignore empty and non-existing folders", () => {
    const sourceFileMutation = createSourceFile(
      "nameAPI.ts",
      `class Name {
          @Post
          createUser(): Promise<User> {}

          @Get
          getUsers(): Promise<User[]> {}
      }`,
      ScriptTarget.ESNext,
      true,
      ScriptKind.TS
    );

    delinter.delint(sourceFileMutation);

    const sourceFileModel = createSourceFile(
      "userModel.ts",
      `interface User {
        name: string;
      }`,
      ScriptTarget.ESNext,
      true,
      ScriptKind.TS
    );

    delinter.delint(sourceFileModel);

    expect(delinter.queries.length).toBe(1);
    expect(delinter.mutations.length).toBe(1);
    expect(delinter._types.size).toBe(1);
  });

  it("should create correct GQL types for scalars", () => {
    const sourceFileMutation = createSourceFile(
      "nameAPI.ts",
      `class Name {
          @Post
          createString(): Promise<string> {}

          @Get
          getString(): Promise<string[]> {}

          @Post
          createBool(): Promise<boolean> {}

          @Get
          getBool(): Promise<boolean[]> {}

          @Post
          createInt(): Promise<integer> {}

          @Get
          getInt(): Promise<integer[]> {}

          @Post
          createFloat(): Promise<float> {}

          @Get
          getFloat(): Promise<float[]> {}
      }`,
      ScriptTarget.ESNext,
      true,
      ScriptKind.TS
    );

    delinter.delint(sourceFileMutation);

    const sourceFileModel = createSourceFile(
      "userModel.ts",
      `interface User {
        name: string;
      }`,
      ScriptTarget.ESNext,
      true,
      ScriptKind.TS
    );

    delinter.delint(sourceFileModel);

    expect(delinter.queries.length).toBe(4);
    expect(delinter.mutations.length).toBe(4);
    expect(delinter._types.size).toBe(1);
  });
});
