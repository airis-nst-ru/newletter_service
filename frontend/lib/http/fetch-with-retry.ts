import { ApiError } from "./api-error";

type FetchWithRetryOptions = RequestInit & {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  retryStatuses?: number[];
};

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status: number, retryStatuses: number[]): boolean {
  return retryStatuses.includes(status);
}

function mergeAbortSignals(
  requestSignal: AbortSignal | null | undefined,
  timeoutSignal: AbortSignal,
): AbortSignal {
  if (!requestSignal) {
    return timeoutSignal;
  }

  const controller = new AbortController();

  function abort() {
    controller.abort();
  }

  requestSignal.addEventListener("abort", abort, { once: true });
  timeoutSignal.addEventListener("abort", abort, { once: true });

  return controller.signal;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  globalThis.setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export async function fetchWithRetry(
  input: string | URL | Request,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryStatuses = DEFAULT_RETRY_STATUSES,
    signal,
    ...requestInit
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const timeoutSignal = createTimeoutSignal(timeoutMs);

    try {
      const response = await fetch(input, {
        ...requestInit,
        signal: mergeAbortSignals(signal, timeoutSignal),
      });

      if (!shouldRetryStatus(response.status, retryStatuses) || attempt === retries) {
        return response;
      }

      await delay(retryDelayMs * 2 ** attempt);
    } catch (error) {
      lastError = error;

      if (signal?.aborted || attempt === retries) {
        break;
      }

      await delay(retryDelayMs * 2 ** attempt);
    }
  }

  throw new ApiError("Unable to reach the server. Please try again.", {
    code: "NETWORK_ERROR",
    cause: lastError,
  });
}
