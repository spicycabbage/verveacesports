import Link from "next/link";
import { Mountain } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-bold tracking-tight ${className ?? ""}`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <Mountain className="h-4 w-4" />
      </span>
      <span className="text-lg">VerveaceSports</span>
    </Link>
  );
}
