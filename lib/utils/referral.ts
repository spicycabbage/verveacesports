import { REFERRAL_COOKIE } from "@/lib/constants";

export function isValidReferralCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return /^[A-Z0-9]{6,12}$/.test(code);
}

export function getReferralCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${REFERRAL_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
