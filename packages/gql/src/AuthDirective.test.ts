import { AuthenticationError, AuthorizationError } from "@the-neon/core";
import AuthDirective from "./AuthDirective";

describe("AuthDirective", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("visitObject", () => {
    it("sets _requiredAuthRoles on the type from args.roles", () => {
      const mockAuthorizer = {};
      const mockConfig = { args: { roles: ["admin-read"] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined as string[] | undefined,
        getFields: () => ({}),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.visitObject(mockObjectType);
      expect(mockObjectType._requiredAuthRoles).toEqual(["admin-read"]);
    });

    it("wraps fields by setting _authFieldsWrapped flag", () => {
      const mockAuthorizer = {};
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        getFields: () => ({}),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.visitObject(mockObjectType);
      expect(mockObjectType._authFieldsWrapped).toBe(true);
    });

    it("does not re-wrap already wrapped types", () => {
      const mockAuthorizer = {};
      const mockConfig = { args: { roles: [] } };
      const mockGetFields = jest.fn(() => ({}));
      const mockObjectType = {
        _authFieldsWrapped: true,
        getFields: mockGetFields,
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.visitObject(mockObjectType);
      expect(mockGetFields).not.toHaveBeenCalled();
    });
  });

  describe("visitFieldDefinition", () => {
    it("sets _requiredAuthRoles on the field from args.roles", () => {
      const mockAuthorizer = {};
      const mockConfig = { args: { roles: ["admin-write"] } };
      const mockField = {
        _requiredAuthRoles: undefined as string[] | undefined,
        resolve: () => {},
      };
      const mockObjectType = {
        _authFieldsWrapped: false,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.visitFieldDefinition(mockField, { objectType: mockObjectType });
      expect(mockField._requiredAuthRoles).toEqual(["admin-write"]);
    });

    it("wraps the object type when visiting a field", () => {
      const mockAuthorizer = {};
      const mockConfig = { args: { roles: [] } };
      const mockField = {};
      const mockObjectType = {
        _authFieldsWrapped: false,
        getFields: () => ({}),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.visitFieldDefinition(mockField, { objectType: mockObjectType });
      expect(mockObjectType._authFieldsWrapped).toBe(true);
    });
  });

  describe("ensureFieldsWrapped", () => {
    it("field without required roles calls resolve directly", async () => {
      const mockResolve = jest.fn().mockResolvedValue("direct result");
      const mockField = {
        name: "testField",
        resolve: mockResolve as any,
        _requiredAuthRoles: undefined as string[] | undefined,
        authorizer: undefined as any,
      };
      const mockAuthorizer = {
        getAuthenticatedUser: jest.fn().mockResolvedValue(null),
      };
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.ensureFieldsWrapped(mockObjectType);
      (mockField as any).authorizer = mockAuthorizer;
      const context = {};
      const result = await mockField.resolve(undefined, {}, context);
      expect(mockResolve).toHaveBeenCalled();
      expect(result).toBe("direct result");
    });

    it("field with unauthenticated user throws AuthenticationError", async () => {
      const mockField = {
        name: "testField",
        resolve: jest.fn() as any,
        _requiredAuthRoles: ["admin-read"] as string[],
        authorizer: undefined as any,
      };
      const mockAuthorizer = {
        getAuthenticatedUser: jest.fn().mockResolvedValue(null),
      };
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.ensureFieldsWrapped(mockObjectType);
      (mockField as any).authorizer = mockAuthorizer;
      const context = {};
      await expect(mockField.resolve(undefined, {}, context)).rejects.toThrow(
        AuthenticationError,
      );
    });

    it("field with authenticated owner bypasses role check", async () => {
      const mockResolve = jest.fn().mockResolvedValue("owner result");
      const mockField = {
        name: "testField",
        resolve: mockResolve as any,
        _requiredAuthRoles: ["admin-read"] as string[],
        authorizer: undefined as any,
      };
      const mockAuthorizer = {
        getAuthenticatedUser: jest
          .fn()
          .mockResolvedValue({ isOwner: true, permissions: {} }),
      };
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.ensureFieldsWrapped(mockObjectType);
      (mockField as any).authorizer = mockAuthorizer;
      const context = {};
      const result = await mockField.resolve(undefined, {}, context);
      expect(mockResolve).toHaveBeenCalled();
      expect(result).toBe("owner result");
    });

    it("field with insufficient permissions throws AuthorizationError", async () => {
      const roleEncoded = Buffer.from(
        JSON.stringify([{ entity: "user", action: "Delete" }]),
      ).toString("base64");
      const mockField = {
        name: "testField",
        resolve: jest.fn() as any,
        _requiredAuthRoles: [roleEncoded] as string[],
        authorizer: undefined as any,
      };
      const mockAuthorizer = {
        getAuthenticatedUser: jest
          .fn()
          .mockResolvedValue({ isOwner: false, permissions: { user: 0 } }),
      };
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.ensureFieldsWrapped(mockObjectType);
      (mockField as any).authorizer = mockAuthorizer;
      const context = {};
      await expect(mockField.resolve(undefined, {}, context)).rejects.toThrow(
        AuthorizationError,
      );
    });

    it("field with sufficient permissions calls resolve", async () => {
      const roleEncoded = Buffer.from(
        JSON.stringify([{ entity: "user", action: "Read" }]),
      ).toString("base64");
      const mockResolve = jest.fn().mockResolvedValue("permitted result");
      const mockField = {
        name: "testField",
        resolve: mockResolve as any,
        _requiredAuthRoles: [roleEncoded] as string[],
        authorizer: undefined as any,
      };
      const mockAuthorizer = {
        getAuthenticatedUser: jest
          .fn()
          .mockResolvedValue({ isOwner: false, permissions: { user: 1 } }),
      };
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.ensureFieldsWrapped(mockObjectType);
      (mockField as any).authorizer = mockAuthorizer;
      const context = {};
      const result = await mockField.resolve(undefined, {}, context);
      expect(mockResolve).toHaveBeenCalled();
      expect(result).toBe("permitted result");
    });

    it("'any' entity permission bypasses role check", async () => {
      const roleEncoded = Buffer.from(
        JSON.stringify([{ entity: "any", action: "Read" }]),
      ).toString("base64");
      const mockResolve = jest.fn().mockResolvedValue("any result");
      const mockField = {
        name: "testField",
        resolve: mockResolve as any,
        _requiredAuthRoles: [roleEncoded] as string[],
        authorizer: undefined as any,
      };
      const mockAuthorizer = {
        getAuthenticatedUser: jest
          .fn()
          .mockResolvedValue({ isOwner: false, permissions: {} }),
      };
      const mockConfig = { args: { roles: [] } };
      const mockObjectType = {
        _authFieldsWrapped: false,
        _requiredAuthRoles: undefined,
        getFields: () => ({ testField: mockField }),
      };
      const directive = new (AuthDirective as any)(mockConfig, mockAuthorizer);
      directive.ensureFieldsWrapped(mockObjectType);
      (mockField as any).authorizer = mockAuthorizer;
      const context = {};
      const result = await mockField.resolve(undefined, {}, context);
      expect(mockResolve).toHaveBeenCalled();
      expect(result).toBe("any result");
    });
  });
});
