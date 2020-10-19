import { parse as parseUuid } from "uuid";

export class Valid {
  public static uuid(argValue: string): boolean {
    if (argValue) {
      try {
        parseUuid(argValue);
      } catch {
        return false;
      }
    }
    return true;
  }

  public static notEmpty(argValue: string): boolean {
    return (
      (argValue &&
        Object.prototype.hasOwnProperty.call(argValue, "length") &&
        argValue.length > 0) ||
      Object.keys(argValue).length > 0
    );
  }

  public static email(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
