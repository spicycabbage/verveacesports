import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less anon client for public, RLS-guarded storefront reads (products,
 * variants, published reviews, active locations).
 *
 * Safe to call inside `"use cache"` scopes — it touches no request APIs, so the
 * result can be shared across visitors. Never use it for anything user-scoped.
 */
export function createSupabasePublicClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
