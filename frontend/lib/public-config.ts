import { AUTH_ROUTES } from "@/lib/auth/constants";

export const publicConfig = {
  authSuccessRedirectPath:
    process.env.NEXT_PUBLIC_AUTH_SUCCESS_REDIRECT_PATH || AUTH_ROUTES.dashboard,
};
