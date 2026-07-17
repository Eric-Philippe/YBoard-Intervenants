import { env } from "~/env";

/**
 * Secret used to sign and verify session tokens.
 *
 * Resolved at call time rather than at module load so that a build without the
 * variable still succeeds, and throws when it is missing so the application
 * fails closed. It must never fall back to a literal: this repository is
 * public, so any default value here would be a publicly known signing key.
 */
export function getJwtSecret(): string {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Refusing to sign or verify tokens without a configured secret.",
    );
  }
  return secret;
}
