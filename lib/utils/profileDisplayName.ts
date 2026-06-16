/** Display name from profile columns (password + OAuth). */
export function profileDisplayName(p: {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}): string {
  const f = (p.first_name ?? "").trim();
  const l = (p.last_name ?? "").trim();
  const combined = `${f} ${l}`.trim();
  if (combined) return combined;
  return (p.full_name ?? "").trim();
}
