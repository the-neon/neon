import IUser from "./IUser";

interface IAuthorizer {
  getAuthenticcatedUser(): IUser;
}

export default IAuthorizer;
