/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import { GraphQLError } from "graphql";

const errorHandler = (ex: GraphQLError): Error => {
  const originalErrorType = ex?.originalError?.["type"] ?? null;
  const originalErrorMessage = ex?.originalError?.["message"] ?? "system error";

  // Handle validator error first
  try {
    const jsonErrorMessage = JSON.parse(originalErrorMessage);
    if (jsonErrorMessage.type === "InputError") {
      if (jsonErrorMessage.errors.length > 1) {
        return new UserInputError(originalErrorMessage, {
          inputs: jsonErrorMessage.errors.map(({ key, message }) => ({
            field: key,
            message: message,
          })),
          severity: "error",
        });
      }
      if (jsonErrorMessage.errors.length) {
        return new UserInputError(jsonErrorMessage.errors[0].message, {
          severity: "error",
        });
      }
    }
  } catch (error) {
    console.error(JSON.stringify(ex));
  }

  switch (originalErrorType) {
    case "AuthorizationError":
      return new ForbiddenError(originalErrorMessage);
    case "AuthenticationError":
      return new AuthenticationError(originalErrorMessage);
    case "InputError": {
      const errors = ex.originalError?.["errors"];
      if (!errors) {
        return new UserInputError(originalErrorMessage, { severity: "error" });
      }
      return new UserInputError(originalErrorMessage, {
        inputs: Object.keys(errors).map((key) => ({
          field: key,
          message: errors[key],
        })),
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
