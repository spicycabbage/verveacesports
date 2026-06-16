import { LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SIGN_OUT_PATH } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <a
      href={SIGN_OUT_PATH}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "w-full justify-start gap-2",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </a>
  );
}
