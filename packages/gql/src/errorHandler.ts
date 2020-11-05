/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import { GraphQLError } from "graphql";
import {
  ApplicationError,
  ApplicationErrorCollection,
  ErrorPrefix,
} from "@the-neon/core";

const errorHandler = (ex: GraphQLError): Error => {
  console.error(JSON.stringify(ex));
  const originalErrorType = ex?.originalError?.["type"] ?? null;
  const originalErrorMessage = ex?.originalError?.["message"] ?? "system error";

  switch (originalErrorType) {
    case "AuthorizationError":
      return new ForbiddenError(originalErrorMessage);
    case "AuthenticationError":
      return new AuthenticationError(originalErrorMessage);

    case "ApplicationError": {
      const originalError: ApplicationError = ex.originalError;
      if (originalError.prefix === ErrorPrefix.Authentication) {
        return new AuthenticationError(originalErrorMessage);
      }
      if (originalError.prefix === ErrorPrefix.Authorization) {
        return new ForbiddenError(originalErrorMessage);
      }
      return new UserInputError(originalErrorMessage, {
        affected: originalError.affected,
        code: `${originalError.prefix}_${originalError.reason}`,
        message: originalError.message,
        severity: "error",
      });
    }

    case "ApplicationErrorCollection": {
      const originalError: ApplicationErrorCollection = ex.originalError;
      const errors = originalError.errors;
      if (!errors) {
        return new UserInputError(originalErrorMessage, { severity: "error" });
      }
      if (errors.some((e) => e.prefix === ErrorPrefix.Authentication)) {
        return new AuthenticationError(originalErrorMessage);
      }
      if (errors.some((e) => e.prefix === ErrorPrefix.Authorization)) {
        return new ForbiddenError(originalErrorMessage);
      }

      const inputs = errors.map((e) => ({
        affected: e.affected,
        code: `${e.prefix}_${e.reason}`,
        message: e.message,
      }));

      const code = [...new Set(errors.map((e) => e.prefix))].join("_");

      return new UserInputError(originalErrorMessage, {
        code,
        inputs,
        severity: "error",
      });
    }
    case "InputError": {
      const errors = ex.originalError?.["errors"];
      if (!errors) {
        return new UserInputError(originalErrorMessage, { severity: "error" });
      }

      const inputs = errors.map(({ key, message }) => ({
        field: key,
        message: message,
      }));

      if (inputs.length === 1 && !inputs[0].field) {
        return new UserInputError(inputs[0].message, { severity: "error" });
      }
      return new UserInputError(originalErrorMessage, {
        inputs,
        severity: "error",
      });
    }
    case "NotImplementedYetError":
      return new ApolloError(originalErrorMessage);
    case "ExternalApiError": {
      const configuration: {
        externalSystem: string;
        severity: string;
        debug?: any;
      } = {
        externalSystem: ex.originalError?.["externalApi"],
        severity: "warning",
      };
      logError(ex, configuration);
      return new ApolloError(
        originalErrorMessage,
        "EXTERNAL_API_ERROR",
        configuration
      );
    }
    case "SystemError":
    default: {
      const configuration: Record<string, any> = {
        context: "system error",
        severity: "error",
      };
      logError(ex, configuration);
      return new ApolloError(
        "Something went wrong!",
        "INTERNAL_SERVER_ERROR",
        configuration
      );
    }
  }
};

const logError = (ex, configuration) => {
  const error = {
    path: "",
    message: "",
    configuration: { ...configuration, debug: ex },
  };
  if (ex.path) {
    error.path = ex.path.join(",");
  }
  if (ex.originalError) {
    error.message = ex.originalError.message;
  } else {
    error.message = ex.message;
  }

  console.error(JSON.stringify(error));
};

export default errorHandler;
