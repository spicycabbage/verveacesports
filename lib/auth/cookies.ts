import type { CookieOptions } from "@supabase/ssr";

/**
 * Set when "Remember me" was unchecked. It is itself a session cookie, so it
 * disappears with the browser session along with the auth cookies it governs.
 */
export const SESSION_ONLY_COOKIE = "vs_session_only";

/** Proof the current session came from a reset link (value = user id). */
export const PASSWORD_RESET_COOKIE = "vs_pw_reset";
export const PASSWORD_RESET_PATH = "/reset-password";
export const PASSWORD_RESET_TTL_S = 15 * 60;

function isDeletion(options: CookieOptions): boolean {
  if (options.maxAge !== undefined && options.maxAge <= 0) return true;
  return options.expires !== undefined && new Date(options.expires).getTime() <= Date.now();
}

/** Session-only mode strips persistence; deletions must keep maxAge 0 or chunks linger. */
export function authCookieOptions(options: CookieOptions, sessionOnly: boolean): CookieOptions {
  if (!sessionOnly || isDeletion(options)) return options;
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}
