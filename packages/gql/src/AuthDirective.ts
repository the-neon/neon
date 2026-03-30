import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  Action,
  AuthenticationError,
  AuthorizationError,
} from "@the-neon/core";
import Authorizer from "./Authorizer";
import { GraphQLSchema } from "graphql";

interface AuthDirectiveArgs {
  roles?: string[];
}

const authDirectiveTransformer = (
  schema: GraphQLSchema,
  authorizer: Authorizer,
  directiveName: string = "auth",
): GraphQLSchema => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];
      if (authDirective) {
        const { resolve } = fieldConfig;
        fieldConfig.resolve = async function (...args) {
          const requiredRoles: string[] =
            (authDirective as AuthDirectiveArgs).roles || [];
          const context = args[2];
          const user = await authorizer?.getAuthenticatedUser();

          if (!user) {
            throw new AuthenticationError();
          }

          let isAllowed = user.isOwner;

          if (!isAllowed && requiredRoles?.[0] && user.permissions) {
            const permissions = user.permissions;
            isAllowed = JSON.parse(
              Buffer.from(requiredRoles[0], "base64").toString(),
            )
              .map(
                (permission: { entity: string; action: string }) =>
                  permission.entity === "any" ||
                  (permissions[permission.entity] &
                    +Action[permission.action]) !==
                    0,
              )
              .reduce((a: boolean, b: boolean) => a && b, true);
          }

          if (isAllowed) {
            context.user = user;
            return resolve?.apply(this, args);
          }
          throw new AuthorizationError();
        };
      }
      return fieldConfig;
    },
  });
};

export { authDirectiveTransformer };
export default authDirectiveTransformer;
