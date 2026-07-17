import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "~/server/jwt";

/**
 * True when the request carries a valid session token.
 *
 * Route handlers are excluded from the page middleware matcher, so every one of
 * them has to perform this check itself.
 *
 * Both carriers are accepted: the Authorization header used by fetch/tRPC, and
 * the token cookie, which is the only credential a browser attaches to a plain
 * navigation such as window.open on a PDF.
 */
export function isAuthenticatedRequest(request: NextRequest): boolean {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ??
    request.cookies.get("token")?.value;

  if (!token) return false;

  try {
    jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}
