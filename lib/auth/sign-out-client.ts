"use client";

import { SIGN_OUT_PATH } from "@/lib/constants";

/** Full navigation so HttpOnly Set-Cookie headers on the redirect are applied. */
export function signOutClient(): void {
  window.location.assign(SIGN_OUT_PATH);
}
