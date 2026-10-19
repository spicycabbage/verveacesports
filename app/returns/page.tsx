import type { Metadata } from "next";
import { VoltArticle } from "@/components/volt/VoltArticle";
import { requireVoltSite } from "@/lib/site/require-volt";

export async function generateMetadata(): Promise<Metadata> {
  const site = await requireVoltSite();
  return {
    title: "Returns & Refunds",
    description: `Return unused Volt Caddy items within 7 days of delivery. Email ${site.supportEmail} for an RMA.`,
    alternates: { canonical: "/returns" },
  };
}

export default async function ReturnsPage() {
  const site = await requireVoltSite();

  return (
    <VoltArticle
      title="Returns & Refunds"
      intro="If you are not satisfied with a purchase, contact us and we will walk through the return."
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">Returns</h2>
        <p className="mt-2">
          You have 7 calendar days to return an item from the date you received it. The item must
          be unused, in the condition you received it, and in the original packaging, with the
          receipt or proof of purchase.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">Refunds</h2>
        <div className="mt-2 space-y-3">
          <p>
            After the item arrives we inspect it and email you the result. Approved refunds go
            back to the original payment method. The time to see the credit depends on the card
            issuer.
          </p>
          <p>
            Email{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-primary hover:underline">
              {site.supportEmail}
            </a>{" "}
            for a return merchandise authorization (RMA) number before you ship anything. Include
            a copy of the receipt in the package. You pay return shipping. Original shipping fees
            are not refunded.
          </p>
          <p>
            Personalized or customized items, gift cards, and sale or clearance items are not
            eligible for a refund.
          </p>
        </div>
      </section>
    </VoltArticle>
  );
}
