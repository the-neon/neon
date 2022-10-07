import { parse as uuidParse } from "uuid";
import { integer, long, float } from "@the-neon/core";
export class Valid {
  public static uuid(argValue: string): boolean {
    if (argValue) {
      try {
        uuidParse(argValue);
      } catch {
        return false;
      }
    }
    return true;
  }

  public static notEmpty(argValue: string): boolean {
    return !(
      // null
      (
        typeof argValue === "undefined" ||
        argValue === null ||
        // string
        (typeof argValue === "string" && argValue.toString().length === 0) ||
        // Array
        (argValue.hasOwnProperty?.("length") && argValue.length === 0) ||
        // Object
        (typeof argValue === "object" && Object.keys(argValue).length === 0)
      )
    );
  }

  public static email(email: string): boolean {
    // do not test if no email is provided (use notEmpty for required fields)
    if (
      (typeof email === "string" && email.length === 0) ||
      typeof email === "undefined" ||
      email === null
    ) {
      return true;
    }

    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public static greaterThanZero(
    argValue: string | number | integer | long | float
  ): boolean {
    return +argValue > 0;
  }
}
