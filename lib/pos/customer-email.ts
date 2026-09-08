import { z } from "zod";

const posEmail = z.string().trim().email().max(200);

/** Valid customer email for a POS invoice, or undefined if blank/invalid. */
export function parsePosCustomerEmail(value: string | undefined | null): string | undefined {
  const parsed = posEmail.safeParse(value ?? "");
  return parsed.success ? parsed.data.toLowerCase() : undefined;
}
