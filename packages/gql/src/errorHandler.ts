/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import { GraphQLError } from "graphql";

const errorHandler = (ex: GraphQLError): Error => {
  console.error(JSON.stringify(ex));
  const originalErrorType = ex?.originalError?.["type"];
  const originalErrorMessage = ex?.originalError?.["message"];

  if (!originalErrorType || !originalErrorMessage) {
    return new Error();
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
