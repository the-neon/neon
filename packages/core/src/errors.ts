class AuthorizationError extends Error {
  public static DEFAULT_ERROR_MESSAGE =
    "You are not authorized to access this resource!";

  public type: string;

  constructor() {
    super(AuthorizationError.DEFAULT_ERROR_MESSAGE);
    this.type = "AuthorizationError";
  }
}

class AuthenticationError extends Error {
  public static DEFAULT_ERROR_MESSAGE = "User is not Authenticated!";

  public type: string;

  constructor() {
    super(AuthenticationError.DEFAULT_ERROR_MESSAGE);
    this.type = "AuthenticationError";
  }
}

export { AuthorizationError, AuthenticationError };
