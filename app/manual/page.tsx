import type { Metadata } from "next";
import { VoltArticle } from "@/components/volt/VoltArticle";
import { requireVoltSite } from "@/lib/site/require-volt";

const QUICK_START = [
  {
    href: "/volt/manuals/quick-start-en.pdf",
    label: "Volt Caddy Pro-S — Quick Start Guide (English)",
  },
  {
    href: "/volt/manuals/quick-start-fr.pdf",
    label: "Volt Caddy Pro-S — Guide de démarrage (Français)",
  },
  {
    href: "/volt/manuals/quick-start-zh.pdf",
    label: "Volt Caddy Pro-S — 快速指南 (中文)",
  },
] as const;

const OWNER = [
  {
    href: "/volt/manuals/owner-manual-en.pdf",
    label: "Volt Caddy Pro-S — Owner Manual (English)",
  },
  {
    href: "/volt/manuals/owner-manual-fr.pdf",
    label: "Volt Caddy Pro-S — Manuel et Guide de l'Utilisateur (Français)",
  },
  {
    href: "/volt/manuals/remote-charging.pdf",
    label: "Remote charging instructions",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  await requireVoltSite();
  return {
    title: "User Manual",
    description: "Volt Caddy Pro-S quick start guides, owner manuals, and remote charging instructions.",
    alternates: { canonical: "/manual" },
  };
}

function ManualLinks({ items }: { items: readonly { href: string; label: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href} download className="text-base font-medium text-primary hover:underline">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function ManualPage() {
  await requireVoltSite();

  return (
    <VoltArticle title="User Manual" intro="Download the Pro-S guides.">
      <section className="space-y-4">
        <ManualLinks items={QUICK_START} />
        <img
          src="/volt/manuals/start-guide.jpg"
          alt="Volt Caddy Pro-S quick start guide cover"
          className="h-auto w-full rounded-md"
        />
      </section>
      <section className="space-y-4">
        <ManualLinks items={OWNER} />
        <img
          src="/volt/manuals/owner-manual.jpg"
          alt="Volt Caddy Pro-S owner manual cover"
          className="h-auto w-full rounded-md"
        />
      </section>
    </VoltArticle>
  );
}
