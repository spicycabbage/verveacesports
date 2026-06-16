import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignupForm } from "./SignupForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import { REFERRAL_COOKIE } from "@/lib/constants";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Create account" };

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/account");

  const c = await cookies();
  const refCode = c.get(REFERRAL_COOKIE)?.value ?? null;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Earn 1 point per dollar from your first order.</CardDescription>
        </CardHeader>
        <CardContent>
          {refCode && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-accent p-3 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Referred by {refCode}</p>
                <p className="text-xs text-muted-foreground">
                  Both of you earn 100 bonus points after your first paid order.
                </p>
              </div>
            </div>
          )}
          <SignupForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
