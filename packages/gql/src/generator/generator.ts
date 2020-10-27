/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "path";
import chalk from "chalk";

import { createSourceFile, ScriptKind, ScriptTarget } from "typescript";
import { readdirSync, readFileSync, existsSync } from "fs";

import { resolveConfig } from "./config";
// import FileService from "./FileService";
import Delinter from "./Delinter";
import { exit } from "process";

const config = resolveConfig();

if (!config) {
  exit();
}

const delinter = new Delinter();
const schema = [];
const resolvers = [];

config.inputDirs.forEach((directory) => {
  console.log("🔨 Parsing", directory);
  // Parse a file

  if (!directory || !existsSync(directory)) {
    return;
  }

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

      delinter.delint(sourceFile);
    }
  });
});

// FileService.generateFiles(
//   schema,
//   resolvers,
//   config.outDir,
//   config.outApiClient
// );
