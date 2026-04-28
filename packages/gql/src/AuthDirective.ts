import {
  Action,
  AuthenticationError,
  AuthorizationError,
} from "@the-neon/core";
import Authorizer from "./Authorizer.js";

interface DirectiveConfig {
  args?: { roles?: string[] };
  name?: string;
  visits?: Record<string, any>;
}

class AuthDirective {
  authorizer: Authorizer;
  args: DirectiveConfig["args"];
  constructor(config: DirectiveConfig, authorizer: Authorizer) {
    this.args = config.args;
    this.authorizer = authorizer;
  }

  public visitObject(type: any): void {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRoles = this.args?.roles;
  }

  public visitFieldDefinition(field: any, details: { objectType: any }): void {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRoles = this.args?.roles;
  }

  public ensureFieldsWrapped(objectType: any): void {
    if (objectType._authFieldsWrapped) {
      return;
    }
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve } = field;
      field.resolve = async function (...args: any[]) {
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
            Buffer.from(requiredRoles[0], "base64").toString(),
          )
            .map(
              (permission: any) =>
                permission.entity === "any" ||
                (user.permissions[permission.entity] &
                  +Action[permission.action]) !==
                  0,
            )
            .reduce((a: boolean, b: boolean) => a && b, true);
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
