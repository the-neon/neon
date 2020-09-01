import * as fs from "fs";
import { parse } from "json5";

// just rc file for now
const configFiles = [".neonrc"];

const defaults = {
  outDir: "./generated",
  inputDirs: ["."],
};

const respolveConfig = (): {
  outDir: string;
  inputDirs: string[];
} => {
  let override = defaults;
  if (fs.existsSync(configFiles[0])) {
    try {
      const configString = fs.readFileSync(configFiles[0], "utf8");
      override = parse(configString);
    } catch (ex) {
      console.error("Error parsing neon configuration", ex);
    }
  }
  return { ...defaults, ...override };
};

export { respolveConfig };
