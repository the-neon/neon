import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import { ApplicationError, ErrorPrefix, InputError } from "@the-neon/core";
import errorHandler from "./errorHandler";
import { GraphQLError } from "graphql";

describe("Error handler tests", () => {
  let sampleMessage: string;
  beforeAll(() => {
    sampleMessage = "sample custom message";
  });

  it("ApplicationError-1 multiple errors should be mapped as UserInputError", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(ErrorPrefix.InputValidationInvalidFormat, ["email"]),
      new ApplicationError(ErrorPrefix.InputValidationRequired, ["email"]),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors)),
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.extensions.reason).toEqual(
      `${ErrorPrefix.InputValidationInvalidFormat}_${ErrorPrefix.InputValidationRequired}`,
    );
    expect(responseError.extensions.inputs).toEqual([
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationInvalidFormat,
        message: "",
        reason: ErrorPrefix.InputValidationInvalidFormat,
      },
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationRequired,
        message: "",
        reason: ErrorPrefix.InputValidationRequired,
      },
    ]);
  });

  it("ApplicationError-2 multiple errors with custom error messages should be mapped as UserInputError with inputs with messages", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.InputValidationInvalidFormat,
        ["email"],
        sampleMessage,
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationRequired,
        ["email"],
        sampleMessage,
      ),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors)),
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.extensions.reason).toEqual(
      `${ErrorPrefix.InputValidationInvalidFormat}_${ErrorPrefix.InputValidationRequired}`,
    );
    expect(responseError.extensions.inputs).toEqual([
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationInvalidFormat,
        message: sampleMessage,
        reason: ErrorPrefix.InputValidationInvalidFormat,
      },
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationRequired,
        message: sampleMessage,
        reason: ErrorPrefix.InputValidationRequired,
      },
    ]);
  });

  it("ApplicationError-3 multiple errors will be mapped as ForbiddenError if there is error with Authorization prefix", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.AuthorizationInvalidFormat,
        ["email"],
        sampleMessage,
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationInvalidFormat,
        ["email"],
        sampleMessage,
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationRequired,
        ["email"],
        sampleMessage,
      ),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors)),
    );

    // Act
    const responseError = errorHandler(graphQlError) as ForbiddenError;

    // Assert
    expect(responseError).toBeDefined();
  });

  it("ApplicationError-4 multiple errors will be mapped as AuthenticationError if there is error with Authentication prefix", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.AuthenticationInvalidFormat,
        ["email"],
        sampleMessage,
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationInvalidFormat,
        ["email"],
        sampleMessage,
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationRequired,
        ["email"],
        sampleMessage,
      ),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors)),
    );

    // Act
    const responseError = errorHandler(graphQlError) as AuthenticationError;

    // Assert
    expect(responseError).toBeDefined();
  });

  it("ApplicationError-5 should be mapped as UserInputError", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.InputValidationInvalidFormat,
      ["email"],
      sampleMessage,
    );
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      originalError,
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.extensions.reason).toEqual(
      ErrorPrefix.InputValidationInvalidFormat,
    );
    expect(responseError.message).toEqual(sampleMessage);
  });

  it("ApplicationError-6 should be mapped as AuthenticationError if there is Authentication prefix", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.AuthenticationInvalidFormat,
      ["email"],
      sampleMessage,
    );
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      originalError,
    );

    // Act
    const responseError = errorHandler(graphQlError) as AuthenticationError;

    // Assert
    expect(responseError).toBeDefined();
  });

  it("ApplicationError-7 should be mapped as ForbiddenError if there is Authorization prefix", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.AuthorizationInvalidFormat,
      ["email"],
      sampleMessage,
    );
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      originalError,
    );

    // Act
    const responseError = errorHandler(graphQlError) as ForbiddenError;

    // Assert
    expect(responseError).toBeDefined();
  });

  describe("non-ApplicationError paths", () => {
    it("ApplicationError with Authentication base prefix maps to AuthenticationError", () => {
      const errors: ApplicationError[] = [
        new ApplicationError(ErrorPrefix.Authentication, ["email"]),
      ];
      const graphQlError: GraphQLError = new GraphQLError(
        "auth error",
        null,
        null,
        null,
        null,
        new Error(JSON.stringify(errors)),
      );

      const responseError = errorHandler(graphQlError) as AuthenticationError;

      expect(responseError).toBeInstanceOf(AuthenticationError);
    });

    it("ApplicationError with Authorization base prefix maps to ForbiddenError", () => {
      const errors: ApplicationError[] = [
        new ApplicationError(ErrorPrefix.Authorization, ["email"]),
      ];
      const graphQlError: GraphQLError = new GraphQLError(
        "authz error",
        null,
        null,
        null,
        null,
        new Error(JSON.stringify(errors)),
      );

      const responseError = errorHandler(graphQlError) as ForbiddenError;

      expect(responseError).toBeInstanceOf(ForbiddenError);
    });

    it("ApplicationError with NotSupportedAppVersion prefix maps to ApolloError", () => {
      const errors: ApplicationError[] = [
        new ApplicationError(ErrorPrefix.NotSupportedAppVersion, ["email"]),
      ];
      const graphQlError: GraphQLError = new GraphQLError(
        "not supported",
        null,
        null,
        null,
        null,
        new Error(JSON.stringify(errors)),
      );

      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.extensions?.code).toBe(
        ErrorPrefix.NotSupportedAppVersion,
      );
    });

    it("ExternalApiError with path logs error path", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "external API failed",
        null,
        null,
        null,
        null,
        { type: "ExternalApiError", externalApi: "payment-service" } as any,
      );
      (graphQlError as any).path = ["users", "1"];

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      errorHandler(graphQlError);

      expect(consoleSpy).toHaveBeenCalled();
      const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
      expect(logged.path).toBe("users,1");
      consoleSpy.mockRestore();
    });

    it("SystemError logs error with message from originalError", () => {
      const originalError = new Error("disk full");
      (originalError as any).type = "SystemError";
      const graphQlError: GraphQLError = new GraphQLError(
        "system failure",
        null,
        null,
        null,
        null,
        originalError,
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      errorHandler(graphQlError);

      expect(consoleSpy).toHaveBeenCalled();
      const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
      expect(logged.message).toBe("disk full");
      consoleSpy.mockRestore();
    });

    it("SystemError without originalError logs error.message", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "something bad happened",
        null,
        null,
        null,
        null,
        { type: "SystemError" } as any,
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      errorHandler(graphQlError);

      expect(consoleSpy).toHaveBeenCalled();
      const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
      expect(logged.message).toBeUndefined();
      consoleSpy.mockRestore();
    });

    it("tryParse returns null for invalid JSON", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "plain message",
        null,
        null,
        null,
        null,
        new Error("not valid json { broken"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.extensions?.code).toBe("INTERNAL_SERVER_ERROR");
      consoleSpy.mockRestore();
    });

    it("tryParse returns parsed errors when JSON does not have ApplicationError type", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "some message",
        null,
        null,
        null,
        null,
        new Error(JSON.stringify({ foo: "bar" })),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.extensions?.code).toBe("INTERNAL_SERVER_ERROR");
      consoleSpy.mockRestore();
    });

    it("ExternalApiError should be mapped as ApolloError with EXTERNAL_API_ERROR code", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "external API failed",
        null,
        null,
        null,
        null,
        {
          type: "ExternalApiError",
          externalApi: "payment-service",
        } as any as any,
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.extensions?.code).toBe("EXTERNAL_API_ERROR");
      expect(responseError.extensions?.externalSystem).toBe("payment-service");
      expect(responseError.extensions?.severity).toBe("warning");
      consoleSpy.mockRestore();
    });

    it("SystemError should be mapped as ApolloError with INTERNAL_SERVER_ERROR code", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "system failure",
        null,
        null,
        null,
        null,
        { type: "SystemError" } as any,
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.extensions?.code).toBe("INTERNAL_SERVER_ERROR");
      expect(responseError.extensions?.severity).toBe("error");
      consoleSpy.mockRestore();
    });

    it("default case should be mapped as ApolloError with INTERNAL_SERVER_ERROR code", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "unknown error",
        null,
        null,
        null,
        null,
        { type: "SomeUnknownError" } as any,
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.extensions?.code).toBe("INTERNAL_SERVER_ERROR");
      consoleSpy.mockRestore();
    });

    it("NotImplementedYetError should be mapped as ApolloError", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "feature not implemented",
        null,
        null,
        null,
        null,
        Object.assign(new Error("feature not implemented"), {
          type: "NotImplementedYetError",
        }) as any,
      );

      const responseError = errorHandler(graphQlError) as ApolloError;

      expect(responseError).toBeInstanceOf(ApolloError);
      expect(responseError.message).toBe("feature not implemented");
    });

    it("InputError without errors array should be mapped as UserInputError", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "invalid input",
        null,
        null,
        null,
        null,
        { type: "InputError" } as any,
      );

      const responseError = errorHandler(graphQlError) as UserInputError;

      expect(responseError).toBeInstanceOf(UserInputError);
      expect(responseError.extensions?.severity).toBe("error");
    });

    it("InputError with single error and no field should return UserInputError with that message", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "validation failed",
        null,
        null,
        null,
        null,
        {
          type: "InputError",
          errors: [{ key: "", message: "field required" }],
        } as any,
      );

      const responseError = errorHandler(graphQlError) as UserInputError;

      expect(responseError).toBeInstanceOf(UserInputError);
      expect(responseError.message).toBe("field required");
    });

    it("AuthorizationError without ApplicationError context should be ForbiddenError", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "access denied",
        null,
        null,
        null,
        null,
        Object.assign(new Error("access denied"), {
          type: "AuthorizationError",
        }) as any,
      );

      const responseError = errorHandler(graphQlError) as ForbiddenError;

      expect(responseError).toBeInstanceOf(ForbiddenError);
      expect(responseError.message).toBe("access denied");
    });

    it("AuthenticationError without ApplicationError context should be AuthenticationError", () => {
      const graphQlError: GraphQLError = new GraphQLError(
        "not authenticated",
        null,
        null,
        null,
        null,
        Object.assign(new Error("not authenticated"), {
          type: "AuthenticationError",
        }) as any,
      );

      const responseError = errorHandler(graphQlError) as AuthenticationError;

      expect(responseError).toBeInstanceOf(AuthenticationError);
      expect(responseError.message).toBe("not authenticated");
    });

    describe("Validate decorator InputError integration", () => {
      it("Validate decorator InputError with field-level errors maps to UserInputError with inputs array", () => {
        const inputError = new InputError("Validation failed", [
          new Map([["email", "Invalid email address"]]),
          new Map([["name", "Name is required"]]),
        ]);
        const graphQlError: GraphQLError = new GraphQLError(
          "Validation failed",
          null,
          null,
          null,
          null,
          inputError,
        );

        const responseError = errorHandler(graphQlError) as UserInputError;

        expect(responseError).toBeInstanceOf(UserInputError);
        expect(responseError.extensions?.inputs).toEqual([
          { field: "email", message: "Invalid email address" },
          { field: "name", message: "Name is required" },
        ]);
      });

      it("Validate decorator InputError with single fieldless error uses message directly", () => {
        const inputError = new InputError("Validation failed", [
          new Map([["", "field is required"]]),
        ]);
        const graphQlError: GraphQLError = new GraphQLError(
          "Validation failed",
          null,
          null,
          null,
          null,
          inputError,
        );

        const responseError = errorHandler(graphQlError) as UserInputError;

        expect(responseError).toBeInstanceOf(UserInputError);
        expect(responseError.message).toBe("field is required");
      });

      it("Validate decorator InputError without errors array falls back to generic UserInputError", () => {
        const inputError = new InputError("Validation failed");
        const graphQlError: GraphQLError = new GraphQLError(
          "Validation failed",
          null,
          null,
          null,
          null,
          inputError,
        );

        const responseError = errorHandler(graphQlError) as UserInputError;

        expect(responseError).toBeInstanceOf(UserInputError);
        expect(responseError.extensions?.severity).toBe("error");
      });
    });
  });
});
