import User from "./User";

interface Authorizer {
  getAuthenticatedUser(): User;
}

export default Authorizer;
