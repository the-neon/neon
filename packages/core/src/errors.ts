import { ErrorPrefix } from "./enums";

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
  public errors: Map<string, string>[];

  constructor(customMessage?: string, errors?: Map<string, string>[]) {
    super(customMessage ?? AuthenticationError.DEFAULT_ERROR_MESSAGE);
    this.type = "InputError";
    this.errors = errors ?? [];
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

class ApplicationError extends Error {
  public type: string;
  public prefix?: ErrorPrefix;
  public affected?: string[];
  public _message: string;

  constructor(prefix?: ErrorPrefix, affected?: string[], message?: string) {
    super(message);
    this.prefix = prefix ?? ErrorPrefix.System;

    this.affected = affected ?? [];
    this.type = "ApplicationError";
    this._message = message || "";
  }
}

export {
  ApplicationError,
  AuthenticationError,
  AuthorizationError,
  InputError,
  ItemNotFoundError,
};
