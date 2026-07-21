import Link from "next/link";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { FAQ_SECTIONS } from "@/lib/content/faq";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about shipping, returns, orders, and VerveaceSports products.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {" / FAQ"}
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Quick answers about shipping, returns, BleeqUp, MGI &amp; Motocaddy products, loyalty
        points, and checkout. Can&apos;t find what you need?{" "}
        <a href="mailto:support@verveacesports.com" className="text-primary hover:underline">
          Email support
        </a>
        .
      </p>
      <div className="mt-8 sm:mt-10">
        <FaqAccordion sections={FAQ_SECTIONS} />
      </div>
    </div>
  );
}
