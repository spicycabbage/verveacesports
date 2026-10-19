import type { Metadata } from "next";
import { VoltArticle } from "@/components/volt/VoltArticle";
import { requireVoltSite } from "@/lib/site/require-volt";

export async function generateMetadata(): Promise<Metadata> {
  const site = await requireVoltSite();
  return {
    title: "Contact",
    description: `Technical support for Volt Caddy: ${site.supportEmail}.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const site = await requireVoltSite();

  return (
    <VoltArticle
      title="Contact"
      intro="Technical support and order questions go to the same inbox."
    >
      <p>
        <a
          href={`mailto:${site.supportEmail}`}
          className="text-base font-medium text-primary hover:underline"
        >
          {site.supportEmail}
        </a>
      </p>
      <p>Include your order number if you are writing about a purchase, return, or warranty.</p>
    </VoltArticle>
  );
}
