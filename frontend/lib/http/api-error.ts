export type ApiErrorOptions = {
  status?: number;
  code?: string;
  cause?: unknown;
};

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.cause = options.cause;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
