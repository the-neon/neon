import { IAppContext } from "@the-neon/core/lib/IAppContext";

export enum Validator {
  notEmpty,
  email,
  uuid,
}

export interface ValidationFunction {
  (args: any[], ccontext: IAppContext): boolean;
}

export interface ArgumentValidationFunction {
  (arg: any, ccontext: IAppContext): boolean;
}
