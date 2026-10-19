import type { Currency } from "@/lib/constants";

/** Store / sales clock. PST in winter, PDT in summer. */
export const STORE_TIMEZONE = "America/Los_Angeles";

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function asDate(date: string | Date): Date {
  if (typeof date === "string") {
    const day = date.match(DATE_ONLY);
    if (day) return wallTimeToUtc(date, "12:00:00");
  }
  return new Date(date);
}

function formatParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    hms: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

/** Instant that is `ymd` + `hms` on the store clock. */
export function wallTimeToUtc(ymd: string, hms: string): Date {
  const clock = hms.length === 8 ? hms : hms.slice(0, 8);
  for (const off of ["-07:00", "-08:00"] as const) {
    const d = new Date(`${ymd}T${clock}${off}`);
    const back = formatParts(d);
    if (back.ymd === ymd && back.hms === clock) return d;
  }
  return new Date(`${ymd}T${clock}-08:00`);
}

/** Calendar day in Pacific time (`YYYY-MM-DD`). */
export function pacificDateKey(input: string | Date): string {
  if (typeof input === "string" && DATE_ONLY.test(input)) return input;
  return formatParts(new Date(input)).ymd;
}

/** Add days on the Pacific calendar. `ymd` is `YYYY-MM-DD`. */
export function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Inclusive Pacific calendar days covering two instants. */
export function enumerateStoreDates(from: string, to: string): string[] {
  const dates: string[] = [];
  let cursor = pacificDateKey(from);
  const end = pacificDateKey(to);
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }
  return dates;
}

/** `YYYY-MM-DD` key as a short label, still on the Pacific calendar. */
export function formatShortDateKey(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(wallTimeToUtc(ymd, "12:00:00"));
}

export function startOfStoreDay(ymd: string): Date {
  return wallTimeToUtc(ymd, "00:00:00");
}

export function endOfStoreDay(ymd: string): Date {
  const d = wallTimeToUtc(ymd, "23:59:59");
  d.setMilliseconds(999);
  return d;
}

export function formatPrice(amount: number, _currency: Currency | string = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("en-US").format(points);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(asDate(date));
}

export function formatDateOnly(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(asDate(date));
}
