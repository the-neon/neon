//  ---AEDWR
//  00000001 - only read - 1
//  00000010 - only write - 2
//  00000100 - only delete - 4
//  00001000 - only execute - 8
//  00010000 - only approve - 16
enum Action {
  Read = 1,
  Write = 1 << 1,
  Delete = 1 << 2,
  Execute = 1 << 3,
  Approve = 1 << 4,
}

enum SkipAuthorization {
  no = 0,
  yes = 1,
}

enum ErrorPrefix {
  Authentication = "AUTH",
  Authorization = "AZ",
  Custom = "CUS",
  InputValidation = "IV",
  InputValidationInvalidFormat = "IV.IFMT",
  InputValidationRequired = "IV.RQ",
  InputValidationSmallerThan = "IV.ST",
  InputValidationGreaterThan = "IV.GT",
  NotSupportedAppVersion = "NSAV",
  System = "SYS",
}

export { Action, SkipAuthorization, ErrorPrefix };
