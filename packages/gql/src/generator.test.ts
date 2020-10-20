import { createSourceFile, ScriptKind, ScriptTarget } from "typescript";
import { Delinter } from "./generator/delinter";

describe("schema generator", () => {
  const delinter = new Delinter();
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
});
