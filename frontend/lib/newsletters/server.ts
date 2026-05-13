import { ApiError } from "@/lib/http/api-error";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { getServerEnv } from "@/lib/env";
import type { Newsletter } from "./types";

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function parseNewsletterResponse(response: Response) {
  const payload = (await response.json().catch(() => null)) as BackendApiResponse<
    Newsletter[]
  > | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message || "Unable to load newsletters.", {
      status: response.status,
      code: "NEWSLETTERS_REQUEST_FAILED",
    });
  }

  return payload.data || [];
}

export async function getAllNewsletters(cookieHeader: string): Promise<Newsletter[]> {
  const { backendApiBaseUrl } = getServerEnv();
  const response = await fetchWithRetry(`${backendApiBaseUrl}/api/v1/newsletters`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  return parseNewsletterResponse(response);
}
