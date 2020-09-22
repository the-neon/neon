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

  constructor(message?: string) {
    super(message ?? AuthenticationError.DEFAULT_ERROR_MESSAGE);
    this.type = "AuthenticationError";
  }
}

class InputError extends Error {
  public static DEFAULT_ERROR_MESSAGE = "Request input is not valid!";

  public type: string;

  constructor(customMessage?: string) {
    super(customMessage ?? AuthenticationError.DEFAULT_ERROR_MESSAGE);
    this.type = "InputError";
  }
}

class ItemNotFoundError extends Error {
  public static DEFAULT_ERROR_MESSAGE = "Requested item is not found!";

  public type: string;

  constructor() {
    super(AuthenticationError.DEFAULT_ERROR_MESSAGE);
    this.type = "ItemNotFoundError";
  }
}

export {
  AuthorizationError,
  AuthenticationError,
  InputError,
  ItemNotFoundError,
};
