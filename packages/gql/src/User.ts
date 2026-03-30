interface User {
  isOwner: boolean;
  permissions?: Record<string, number>;
}

export default User;
