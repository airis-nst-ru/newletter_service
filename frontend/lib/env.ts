function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getServerEnv() {
  return {
    backendApiBaseUrl: stripTrailingSlash(requiredEnv("BACKEND_API_BASE_URL")),
  };
}
