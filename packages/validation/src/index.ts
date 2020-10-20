/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Valid } from "./Validity";
import {
  ArgumentValidationFunction,
  ValidationFunction,
  Validator,
} from "./Validator";

/**
 * Method decorator for authlidation
 */
export function Validate(
  domain: {
    [key: string]:
      | (Validator | ArgumentValidationFunction)
      | (Validator | ArgumentValidationFunction)[];
  },
  functions?: ValidationFunction | ValidationFunction[]
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const fnString = originalMethod.toString();

    const params = fnString
      .replace(/^async /, "")
      .replace(/^function /, "")
      .replace(`${propertyKey}(`, "")
      .replace(/\).*/, "")
      .split("\n")[0]
      .split(",")
      .map((a) => a.trim());

    //wrapping the original method
    descriptor.value = function (...args: any[]) {
      const validationErrors: string[] = [];

      if (functions) {
        let fns: any[];
        if (!Array.isArray(functions)) {
          fns = [functions];
        } else {
          fns = functions;
        }

        fns.forEach((fn) => {
          if (typeof fn === "function") {
            try {
              fn(args, this["context"]);
            } catch (ex) {
              validationErrors.push(ex.message);
            }
          }
        });
      }

      Object.keys(domain).forEach((key) => {
        if (key === "function") {
          try {
            const localFn = domain[key] as Function;
            const { fn, args } = localFn();
            fn(params, args, arguments, this);
          } catch (ex) {
            validationErrors.push(ex.message);
          }
          return;
        }

        const ndx = params.indexOf(key);
        domain[key];
        const argValue = args[ndx];

        if (ndx < 0) {
          console.warn(
            `invalid validation key '${key}' on ${target.constructor.name}.${propertyKey}. Possible keys: ${params} `
          );
        } else {
          const validators = (Array.isArray(domain[key])
            ? domain[key]
            : [domain[key]]) as Array<Validator | Function>;

          for (const validator of validators) {
            if (typeof validator === "function") {
              try {
                validator(argValue, this);
              } catch (ex) {
                validationErrors.push(`'${key}' ${ex.message}`);
              }
            } else {
              switch (validator) {
                case Validator.email:
                  if (!Valid.email(argValue)) {
                    validationErrors.push(`Invalid email address for '${key}`);
                  }
                  break;

                case Validator.notEmpty:
                  if (!Valid.notEmpty(argValue)) {
                    validationErrors.push(`'${key}'is required`);
                  }
                  break;

                case Validator.uuid:
                  if (!Valid.uuid(argValue)) {
                    validationErrors.push(`'${key}'is not valid UUID`);
                  }
                  break;

                default:
                  validationErrors.push(`Invlid validation for '${key}'`);
                  break;
              }
            }
          }
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(JSON.stringify(validationErrors));
      }

      return originalMethod.apply(this, args);
    };
  };
}
