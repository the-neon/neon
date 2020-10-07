import { SchemaDirectiveVisitor } from "graphql-tools";
import {
  Action,
  AuthenticationError,
  AuthorizationError,
} from "@the-neon/core";
import Authorizer from "./Authorizer";

class AuthDirective extends SchemaDirectiveVisitor {
  authorizer: Authorizer;
  constructor(config: any, authorizer: Authorizer) {
    super(config);
    this.authorizer = authorizer;
  }

  public visitObject(type: any): void {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRoles = this["args"]?.roles;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  public visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRoles = this.args.roles;
  }

  public ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) {
      return;
    }
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve } = field;
      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRoles: string[] =
          field._requiredAuthRoles || objectType._requiredAuthRoles;

        if (!requiredRoles) {
          return resolve.apply(this, args);
        }

        const context = args[2];
        const user = await this.authorizer?.getAuthenticatedUser();
        if (!user) {
          throw new AuthenticationError();
        }

        let isAllowed = user.isOwner;

        if (!isAllowed && requiredRoles[0] && user.permissions) {
          isAllowed = JSON.parse(
            Buffer.from(requiredRoles[0], "base64").toString()
          )
            .map(
              (permission) =>
                permission.entity === "any" ||
                (user.permissions[permission.entity] &
                  +Action[permission.action]) !==
                  0
            )
            .reduce((a, b) => a && b, true);
        }

        if (isAllowed) {
          context.user = user;
          return resolve.apply(this, args);
        }
        throw new AuthorizationError();
      };
    });
  }
}

export default AuthDirective;
