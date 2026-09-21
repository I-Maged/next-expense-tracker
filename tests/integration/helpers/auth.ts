import { auth } from "@/lib/auth";

export type TestUser = {
  id: string;
  email: string;
  name: string;
  /** Raw session token (DB primary lookup), for debugging/assertions. */
  sessionToken: string;
  /** Full `cookie` header value from the real Set-Cookie response. */
  cookieHeader: string;
};

const PASSWORD = "integration-Test-123!";

function uniqueEmail(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}@example.com`;
}

function extractSessionToken(result: unknown): string | null {
  if (typeof result !== "object" || result === null) return null;
  if ("token" in result && typeof result.token === "string")
    return result.token;
  const data = (result as { data?: unknown }).data;
  if (
    typeof data === "object" &&
    data !== null &&
    "token" in data &&
    typeof data.token === "string"
  )
    return data.token;
  return null;
}

/**
 * Capture the real Set-Cookie headers better-auth issues.
 * The session cookie value is SIGNED — the raw token alone is not enough.
 */
async function captureCookieHeader(
  email: string,
  password: string,
): Promise<string> {
  const response = (await auth.api.signInEmail({
    body: { email, password },
    headers: new Headers(),
    asResponse: true,
  })) as unknown as Response;

  if (!(response instanceof Response)) {
    throw new Error(
      `[integration] sign-in for ${email} did not return a Response`,
    );
  }
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(
          (v): v is string => v !== null,
        );
  const pairs = setCookies.map((c) => c.split(";")[0]?.trim() ?? "");
  const header = pairs.filter(Boolean).join("; ");
  if (!header)
    throw new Error(`[integration] sign-in for ${email} set no cookies`);
  return header;
}

/**
 * Real better-auth email+password flow against the test DB:
 * sign-up (creates user/account/session rows) + sign-in (captures cookies).
 */
export async function signUpTestUser(prefix = "int"): Promise<TestUser> {
  const email = uniqueEmail(prefix);
  const name = `Int ${prefix}`;

  const signedUp = await auth.api.signUpEmail({
    body: { name, email, password: PASSWORD },
    headers: new Headers(),
  });
  const sessionToken = extractSessionToken(signedUp);
  if (!sessionToken)
    throw new Error(`[integration] sign-up for ${email} issued no token`);

  const cookieHeader = await captureCookieHeader(email, PASSWORD);

  const session = await auth.api.getSession({
    headers: new Headers({ cookie: cookieHeader }),
  });
  if (!session?.user)
    throw new Error("[integration] getSession failed for fresh sign-up");

  return { id: session.user.id, email, name, sessionToken, cookieHeader };
}

/**
 * Headers carrying the real session cookies, for mocking next/headers in
 * server-action integration tests. The action under test then
 * authenticates through the REAL auth.api.getSession + test DB.
 */
export function sessionHeaders(user: TestUser): Headers {
  return new Headers({ cookie: user.cookieHeader });
}
