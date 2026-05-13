import { ApiError } from "./api-error";
import { fetchWithRetry } from "./fetch-with-retry";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type JsonRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    return { success: response.ok };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch (error) {
    throw new ApiError("The server returned an invalid response.", {
      status: response.status,
      code: "INVALID_JSON",
      cause: error,
    });
  }
}

export async function requestJson<T>(
  url: string,
  options: JsonRequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithRetry(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await parseJson<T>(response);

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message || "Request failed.", {
      status: response.status,
      code: "API_ERROR",
    });
  }

  return payload;
}
