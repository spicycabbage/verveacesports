import { STORE_TIMEZONE, wallTimeToUtc } from "@/lib/utils/format";

/** `datetime-local` value on the Pacific clock. */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parse a Pacific `datetime-local` value to an ISO instant. */
export function parseOptionalDatetime(value: string | undefined): string | null {
  const match = value?.trim().match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return null;
  const d = wallTimeToUtc(match[1], `${match[2]}:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
