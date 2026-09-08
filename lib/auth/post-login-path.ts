/** Safe internal path after login. Blocks open redirects. */
export function sanitizeAuthNext(raw: string | null | undefined): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/account";
  return raw;
}

/** Admins always land in /admin. Customers keep the requested next path. */
export function postLoginPath(next: string, isAdmin: boolean): string {
  if (isAdmin) return next.startsWith("/admin") ? next : "/admin";
  return next;
}
