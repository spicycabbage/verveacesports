import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseRouteClient,
  purgeSupabaseAuthCookies,
} from "@/lib/supabase/route-handler";

async function signOutResponse(request: NextRequest) {
  const redirectTo = new URL("/", request.url);
  const response = NextResponse.redirect(redirectTo);

  const supabase = createSupabaseRouteClient(request, response);
  await supabase.auth.signOut({ scope: "global" });
  purgeSupabaseAuthCookies(request, response);

  response.headers.set("Cache-Control", "no-store");

  return response;
}

export async function GET(request: NextRequest) {
  return signOutResponse(request);
}

export async function POST(request: NextRequest) {
  return signOutResponse(request);
}
