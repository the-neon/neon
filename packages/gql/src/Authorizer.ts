import User from "./User.js";

interface Authorizer {
  getAuthenticatedUser(): User;
}

export default Authorizer;
