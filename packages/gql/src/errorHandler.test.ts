import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import {
  ApplicationErrorsCollection,
  ApplicationError,
  ErrorPrefix,
  ErrorReason,
} from "@the-neon/core";
import errorHandler from "./errorHandler";
import { GraphQLError } from "graphql";

describe("Error handler tests", () => {
  let sampleMessage: string;
  beforeAll(() => {
    sampleMessage = "sample custom message";
  });

  it("ApplicationErrorsCollection should be mapped as UserInputError", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.InvalidFormat,
        ["email"]
      ),
      new ApplicationError(ErrorPrefix.InputValidation, ErrorReason.Required, [
        "email",
      ]),
    ];
    const applicationErrorsCollection = new ApplicationErrorsCollection(errors);
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      applicationErrorsCollection
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.code).toEqual(ErrorPrefix.InputValidation);
    expect(responseError.extensions.inputs).toEqual([
      {
        affected: ["email"],
        code: `${ErrorPrefix.InputValidation}_${ErrorReason.InvalidFormat}`,
        message: "",
      },
      {
        affected: ["email"],
        code: `${ErrorPrefix.InputValidation}_${ErrorReason.Required}`,
        message: "",
      },
    ]);
  });

  it("ApplicationErrorsCollection with custom error messages should be mapped as UserInputError with inputs with messages", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.InvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.Required,
        ["email"],
        sampleMessage
      ),
    ];
    const applicationErrorsCollection = new ApplicationErrorsCollection(errors);
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      applicationErrorsCollection
    );

    // Act
    const responseError = errorHandler(graphQlError) as UserInputError;

    // Assert
    expect(responseError).toBeDefined();
    expect(responseError.code).toEqual(ErrorPrefix.InputValidation);
    expect(responseError.extensions.inputs).toEqual([
      {
        affected: ["email"],
        code: `${ErrorPrefix.InputValidation}_${ErrorReason.InvalidFormat}`,
        message: sampleMessage,
      },
      {
        affected: ["email"],
        code: `${ErrorPrefix.InputValidation}_${ErrorReason.Required}`,
        message: sampleMessage,
      },
    ]);
  });

  it("ApplicationErrorsCollection will be mapped as ForbiddenError if there is error with Authorization prefix", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.Authorization,
        ErrorReason.InvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.InvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.Required,
        ["email"],
        sampleMessage
      ),
    ];
    const applicationErrorsCollection = new ApplicationErrorsCollection(errors);
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      applicationErrorsCollection
    );

    // Act
    const responseError = errorHandler(graphQlError) as ForbiddenError;

    // Assert
    expect(responseError).toBeDefined();
  });

  it("ApplicationErrorsCollection will be mapped as AuthenticationError if there is error with Authentication prefix", () => {
    // Arrange
    const errors: ApplicationError[] = [
      new ApplicationError(
        ErrorPrefix.Authentication,
        ErrorReason.InvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.InvalidFormat,
        ["email"],
        sampleMessage
      ),
      new ApplicationError(
        ErrorPrefix.InputValidation,
        ErrorReason.Required,
        ["email"],
        sampleMessage
      ),
    ];
    const applicationErrorsCollection = new ApplicationErrorsCollection(errors);
    const graphQlError: GraphQLError = new GraphQLError(
      sampleMessage,
      null,
      null,
      null,
      null,
      applicationErrorsCollection
    );

    // Act
    const responseError = errorHandler(graphQlError) as AuthenticationError;

    // Assert
    expect(responseError).toBeDefined();
  });

  it("ApplicationError should be mapped as UserInputError", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.InputValidation,
      ErrorReason.InvalidFormat,
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
      `${ErrorPrefix.InputValidation}_${ErrorReason.InvalidFormat}`
    );
    expect(responseError.message).toEqual(sampleMessage);
  });

  it("ApplicationError should be mapped as AuthenticationError if there is Authentication prefix", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.Authentication,
      ErrorReason.InvalidFormat,
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

  it("ApplicationError should be mapped as ForbiddenError if there is Authorization prefix", () => {
    // Arrange
    const originalError = new ApplicationError(
      ErrorPrefix.Authorization,
      ErrorReason.InvalidFormat,
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
