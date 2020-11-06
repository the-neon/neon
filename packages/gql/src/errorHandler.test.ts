import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import { ApplicationError, ErrorPrefix } from "@the-neon/core";
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
      new Error(JSON.stringify(errors))
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.code).toEqual(
      `${ErrorPrefix.InputValidationInvalidFormat}_${ErrorPrefix.InputValidationRequired}`
    );
    expect(responseError.extensions.inputs).toEqual([
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationInvalidFormat,
        message: "",
      },
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationRequired,
        message: "",
      },
    ]);
  });

  it("ApplicationError-2 multiple errors with custom error messages should be mapped as UserInputError with inputs with messages", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.InputValidationInvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationRequired,
        ["email"],
        sampleMessage
      ),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors))
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.code).toEqual(
      `${ErrorPrefix.InputValidationInvalidFormat}_${ErrorPrefix.InputValidationRequired}`
    );
    expect(responseError.extensions.inputs).toEqual([
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationInvalidFormat,
        message: sampleMessage,
      },
      {
        affected: ["email"],
        code: ErrorPrefix.InputValidationRequired,
        message: sampleMessage,
      },
    ]);
  });

  it("ApplicationError-3 multiple errors will be mapped as ForbiddenError if there is error with Authorization prefix", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.AuthorizationInvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationInvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationRequired,
        ["email"],
        sampleMessage
      ),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors))
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
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationInvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidationRequired,
        ["email"],
        sampleMessage
      ),
    ];
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      new Error(JSON.stringify(errors))
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
      sampleMessage
    );
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      originalError
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.code).toEqual(
      ErrorPrefix.InputValidationInvalidFormat
    );
    expect(responseError.message).toEqual(sampleMessage);
  });

  it("ApplicationError-6 should be mapped as AuthenticationError if there is Authentication prefix", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.AuthenticationInvalidFormat,
      ["email"],
      sampleMessage
    );
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      originalError
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
      sampleMessage
    );
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      originalError
    );

    // Act
    const responseError = errorHandler(graphQlError) as ForbiddenError;

    // Assert
    expect(responseError).toBeDefined();
  });
});
