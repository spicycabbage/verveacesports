import Image from "next/image";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className ?? ""}`}>
      <Image
        src="/verveace_logo.png"
        alt="VerveaceSports"
        width={180}
        height={40}
        className="h-8 w-auto sm:h-9 dark:brightness-0 dark:invert"
        priority
      />
    </Link>
  );
}
