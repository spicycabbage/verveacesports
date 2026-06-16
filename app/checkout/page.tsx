import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, last_name, email, loyalty_points")
    .eq("id", user.id)
    .single<{
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string;
      loyalty_points: number;
    }>();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>
      <CheckoutClient
        defaultName={profileDisplayName(profile ?? {})}
        loyaltyPoints={profile?.loyalty_points ?? 0}
      />
    </div>
  );
}
