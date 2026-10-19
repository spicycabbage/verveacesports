import type { Metadata } from "next";
import { VoltArticle } from "@/components/volt/VoltArticle";
import { requireVoltSite } from "@/lib/site/require-volt";

export async function generateMetadata(): Promise<Metadata> {
  await requireVoltSite();
  return {
    title: "About Us",
    description:
      "Volt Technology Inc. builds compact, foldable, remote-controlled electric golf push carts.",
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  await requireVoltSite();

  return (
    <VoltArticle title="About Us">
      <p>
        Volt Technology Inc. builds a remote-controlled electric golf push cart that combines a
        current battery pack, motor, wireless control, and materials chosen for walking golfers.
        Volt Caddy is compact, foldable, and detachable, and can be extended into an outdoor
        utility wagon.
      </p>
      <p>
        The cart is designed by engineers with more than ten years of golf and outdoor sport
        experience. Manufacturing and supply-chain work comes from electric-vehicle production,
        with the same focus on cost control and product quality.
      </p>
    </VoltArticle>
  );
}
