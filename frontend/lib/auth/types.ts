export type AuthUser = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  user: AuthUser;
};
