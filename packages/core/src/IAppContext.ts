import IAuthenticatedUser from "./IAuthenticatedUser";

interface IAppContext {
  /**
   * Authentication token
   */
  token?: string;

  /**
   * Connetion ID (WS, or other)
   */
  connectionId?: string;

  /**
   * Authenticated user
   */
  user?: IAuthenticatedUser;
}
export { IAppContext };
