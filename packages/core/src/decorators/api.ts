import { Action } from "../enums";

/* eslint-disable */
export function Post(target: any, name: string) { }
export function Put(target: any, name: string) { }
export function Delete(target: any, name: string) { }
export function Get(target: any, name: string) { }

/**
 * Method decorator for auth
 *
 * Sample usage:
 *  - @Auth(Entities.Projects, Actions.Write)
 *  - @Auth([{ entity: Entities.Projects, action: Actions.Write }])
 *  - @Auth([{ entity: Entities.CloudAccess, actions: [Actions.Write, Actions.Deactivate] }])
 *  - @Auth(Entities.Infrastructures, [Actions.Write, Actions.Deactivate])
 * @param roles string[]
 */
export function Auth(roles?: any[] | string, action?: Action | Action[]) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => { };
}

/**
 * Argument decorator for marking identifiers
 * @param target any
 * @param propertyKey string | Symbol
 * @param parameterIndex number
 */
export function key(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) { }
