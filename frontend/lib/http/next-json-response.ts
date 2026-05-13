export function getSetCookieHeaders(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    return withGetSetCookie.getSetCookie();
  }

  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
  setCookieHeaders: string[] = [],
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  for (const cookie of setCookieHeaders) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}
