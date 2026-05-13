import { NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { ApiError, getErrorMessage } from "@/lib/http/api-error";
import { getSetCookieHeaders, jsonResponse } from "@/lib/http/next-json-response";
import type { SignInRequest } from "@/lib/auth/types";

export async function POST(request: NextRequest): Promise<Response> {
  let credentials: SignInRequest;

  try {
    credentials = (await request.json()) as SignInRequest;
  } catch {
    return jsonResponse(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const serverEnv = getServerEnv();
    const backendResponse = await fetchWithRetry(
      `${serverEnv.backendApiBaseUrl}/api/v1/auth/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        cache: "no-store",
      },
    );

    const payload = await backendResponse.clone().json().catch(() => null);
    const setCookieHeaders = getSetCookieHeaders(backendResponse.headers);

    if (!backendResponse.ok || !payload?.success) {
      return jsonResponse(
        {
          success: false,
          message: payload?.message || "Unable to sign in.",
        },
        { status: backendResponse.status || 500 },
      );
    }

    return jsonResponse(payload, { status: backendResponse.status }, setCookieHeaders);
  } catch (error) {
    return jsonResponse(
      { success: false, message: getErrorMessage(error) },
      { status: error instanceof ApiError ? error.status || 500 : 500 },
    );
  }
}
