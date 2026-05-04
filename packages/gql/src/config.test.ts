import * as fs from "fs";
import { resolveConfig } from "./config";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe("config", () => {
  const originalCwd = process.cwd;

  afterEach(() => {
    process.cwd = originalCwd;
    jest.resetAllMocks();
  });

  it("returns defaults when .neonrc does not exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const config = resolveConfig();
    expect(config).toEqual({
      outDir: "./generated",
      inputDirs: ["."],
    });
  });

  it("reads and parses .neonrc when present", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ outDir: "./custom-out", inputDirs: ["./src"] }),
    );

    const config = resolveConfig();

    expect(config).toEqual({
      outDir: "./custom-out",
      inputDirs: ["./src"],
    });
  });

  it("merges .neonrc with defaults", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ outDir: "./custom-out" }),
    );

    const config = resolveConfig();

    expect(config.outDir).toBe("./custom-out");
    expect(config.inputDirs).toEqual(["."]);
  });

  it("returns defaults when .neonrc parse fails", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("parse error");
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const config = resolveConfig();

    expect(config).toEqual({
      outDir: "./generated",
      inputDirs: ["."],
    });
    consoleSpy.mockRestore();
  });
});
