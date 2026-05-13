import { requestJson } from "@/lib/http/json-api";
import { AUTH_API_ROUTES } from "./constants";
import type { SignInRequest, SignInResponse } from "./types";

export async function signIn(credentials: SignInRequest): Promise<SignInResponse> {
  const response = await requestJson<SignInResponse>(AUTH_API_ROUTES.signIn, {
    method: "POST",
    body: credentials,
    cache: "no-store",
  });

  if (!response.data) {
    throw new Error("Sign in response was missing user data.");
  }

  return response.data;
}

export async function logout(): Promise<void> {
  await requestJson(AUTH_API_ROUTES.logout, {
    method: "POST",
    cache: "no-store",
  });
}
