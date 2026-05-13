type JwtPayload = {
  exp?: number;
};

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return globalThis.atob(padded);
}

export function isAccessTokenActive(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return false;
  }

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as JwtPayload;

    if (!decoded.exp) {
      return false;
    }

    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
