import GraphQlApiClientGenerator from "./GraphQlApiClientGenerator";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const mockFs = jest.requireMock("fs");

describe("GraphQlApiClientGenerator", () => {
  describe("createReqFields", () => {
    it("returns empty string when responseType is JSON", () => {
      const types = new Map();
      const result = GraphQlApiClientGenerator.createReqFields(
        { responseType: "JSON", params: [] },
        types,
      );
      expect(result).toBe("");
    });

    it("returns scalar field names for user-defined type", () => {
      const types = new Map();
      types.set("User", {
        members: [
          { name: "id", scalar: true },
          { name: "email", scalar: true },
          { name: "createdAt", scalar: false },
        ],
      });
      const result = GraphQlApiClientGenerator.createReqFields(
        { responseType: "User", params: [] },
        types,
      );
      expect(result).toContain("id");
      expect(result).toContain("email");
      expect(result).not.toContain("createdAt");
    });

    it("handles array response type by stripping brackets", () => {
      const types = new Map();
      types.set("User", {
        members: [{ name: "id", scalar: true }],
      });
      const result = GraphQlApiClientGenerator.createReqFields(
        { responseType: "[User]", params: [] },
        types,
      );
      expect(result).toContain("id");
    });

    it("returns empty string when type is not found in types map", () => {
      const types = new Map();
      const result = GraphQlApiClientGenerator.createReqFields(
        { responseType: "UnknownType", params: [] },
        types,
      );
      expect(result).toBe("");
    });
  });

  describe("createClientApis", () => {
    it("generates API methods for queries and mutations", () => {
      const queries = [
        {
          instance: "UserApi",
          methodName: "listUsers",
          params: [{ paramName: "limit", paramType: "Int", optional: false }],
          responseType: "JSON",
        },
      ];
      const mutations = [
        {
          instance: "UserApi",
          methodName: "createUser",
          params: [{ paramName: "name", paramType: "String", optional: true }],
          responseType: "JSON",
        },
      ];
      const types = new Map();

      const apis = GraphQlApiClientGenerator.createClientApis(
        queries,
        mutations,
        types,
      );

      expect(apis.size).toBe(1);
      expect(apis.get("UserApi")).toContain("listUsers");
      expect(apis.get("UserApi")).toContain("createUser");
      expect(apis.get("UserApi")).toContain("LISTUSERS_QUERY");
      expect(apis.get("UserApi")).toContain("mutation");
    });

    it("separates instances into separate API files", () => {
      const queries = [
        {
          instance: "UserApi",
          methodName: "getUser",
          params: [],
          responseType: "JSON",
        },
        {
          instance: "PostApi",
          methodName: "getPost",
          params: [],
          responseType: "JSON",
        },
      ];
      const types = new Map();

      const apis = GraphQlApiClientGenerator.createClientApis(
        queries,
        [],
        types,
      );

      expect(apis.size).toBe(2);
      expect(apis.has("UserApi")).toBe(true);
      expect(apis.has("PostApi")).toBe(true);
    });

    it("generates gql client import statement", () => {
      const queries = [
        {
          instance: "UserApi",
          methodName: "getUser",
          params: [],
          responseType: "JSON",
        },
      ];
      const apis = GraphQlApiClientGenerator.createClientApis(
        queries,
        [],
        new Map(),
      );
      const apiContent = apis.get("UserApi");
      expect(apiContent).toContain("import { apiCall } from './gqlClient';");
    });
  });

  describe("generateFiles", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("writes gqlClient.js when clientPath provided", () => {
      GraphQlApiClientGenerator.generateFiles(
        [],
        [],
        new Map(),
        "/output",
        "/client",
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/gqlClient\.js$/),
        expect.stringContaining("Amplify"),
      );
    });

    it("writes individual API files per instance", () => {
      const queries = [
        {
          instance: "UserApi",
          methodName: "listUsers",
          params: [],
          responseType: "JSON",
        },
      ];

      GraphQlApiClientGenerator.generateFiles(
        queries,
        [],
        new Map(),
        "/output",
        "/client",
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/UserApi\.js$/),
        expect.any(String),
      );
    });

    it("does not write any files when clientPath is not provided", () => {
      GraphQlApiClientGenerator.generateFiles([], [], new Map(), "/output");

      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it("creates directory when clientPath does not exist", () => {
      mockFs.existsSync.mockReturnValue(false);

      GraphQlApiClientGenerator.generateFiles(
        [],
        [],
        new Map(),
        "/output",
        "/client",
      );

      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });

    it("skips directory creation when clientPath already exists", () => {
      mockFs.existsSync.mockReturnValue(true);

      GraphQlApiClientGenerator.generateFiles(
        [],
        [],
        new Map(),
        "/output",
        "/client",
      );

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });
});
