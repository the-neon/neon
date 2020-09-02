import User from "./User";

interface Authorizer {
  getAuthenticcatedUser(): User;
}

export default Authorizer;
