import { NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/auth/constants";
import { getServerEnv } from "@/lib/env";
import { getErrorMessage } from "@/lib/http/api-error";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { getSetCookieHeaders, jsonResponse } from "@/lib/http/next-json-response";

function clearAuthCookies(response: Response): Response {
  const secure = process.env.NODE_ENV === "production";

  response.headers.append(
    "Set-Cookie",
    `${AUTH_COOKIES.accessToken}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`,
  );
  response.headers.append(
    "Set-Cookie",
    `${AUTH_COOKIES.refreshToken}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`,
  );

  return response;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const serverEnv = getServerEnv();
    const backendResponse = await fetchWithRetry(
      `${serverEnv.backendApiBaseUrl}/api/v1/auth/logout`,
      {
        method: "POST",
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      },
    );

    const payload = await backendResponse.clone().json().catch(() => ({
      success: backendResponse.ok,
      message: backendResponse.ok ? "Logout successful" : "Unable to logout.",
    }));
    const response = jsonResponse(
      {
        success: true,
        message: payload?.message || "Logout successful",
      },
      { status: 200 },
      getSetCookieHeaders(backendResponse.headers),
    );

    return clearAuthCookies(response);
  } catch (error) {
    const response = jsonResponse(
      {
        success: true,
        message: getErrorMessage(error),
      },
      { status: 200 },
    );

    return clearAuthCookies(response);
  }
}
