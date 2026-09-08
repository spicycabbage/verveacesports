import { appleTouchIconGET } from "@/lib/site/logo-icon";

/** iOS fetches this exact path for Add to Home Screen — not /apple-icon. */
export function GET() {
  return appleTouchIconGET();
}
