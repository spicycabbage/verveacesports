import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for shopping at VerveaceSports.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 2, 2025"
      intro="By using verveacesports.com or placing an order, you agree to these terms. Please read them before purchasing."
      sections={[
        {
          title: "Store & accounts",
          body: [
            "You must provide accurate account and shipping information. You are responsible for activity under your account.",
            "We may suspend accounts involved in fraud, abuse of promotions, or violation of these terms.",
          ],
        },
        {
          title: "Products & pricing",
          body: [
            "Prices are shown in USD or CAD based on your selected country. Taxes and shipping are calculated at checkout.",
            "We strive to display accurate inventory, but stock is not guaranteed until your payment is authorized. We may cancel orders affected by pricing errors or stock shortages and will refund any charge.",
            "Product images and descriptions are for illustration; minor variations may occur.",
          ],
        },
        {
          title: "Orders & payment",
          body: [
            "Placing an order is an offer to purchase. We accept your order when payment is successfully captured.",
            "Payments are processed by Stripe. By paying, you authorize us to charge your selected payment method for the order total shown at checkout, including applicable discounts, tax, and shipping.",
            "Promotional codes are subject to eligibility rules, usage limits, and expiration dates shown in admin-configured campaigns.",
          ],
        },
        {
          title: "Shipping & returns",
          body: [
            "We ship to addresses in the United States and Canada. Delivery times are estimates, not guarantees.",
            "Free shipping thresholds and return windows described on the site apply unless otherwise stated on your order confirmation.",
            "Items must be returned unused and in original packaging where reasonable. Refunds are issued to the original payment method after inspection.",
          ],
        },
        {
          title: "Loyalty & referrals",
          body: [
            "Loyalty points and referral bonuses have no cash value, may expire or change, and cannot be transferred. We may adjust or revoke points obtained through error or abuse.",
          ],
        },
        {
          title: "Disclaimer",
          body: [
            "Products are sold for general athletic and recreational use. You assume risks inherent in sports activities. To the fullest extent permitted by law, we disclaim warranties not required by applicable consumer protection statutes.",
          ],
        },
        {
          title: "Limitation of liability",
          body: [
            "Our liability for any claim arising from your use of the site or a product is limited to the amount you paid for the relevant order, except where prohibited by law.",
          ],
        },
        {
          title: "Governing law",
          body: [
            "These terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law rules. Disputes will be resolved in courts located in Delaware, unless your local consumer laws require otherwise.",
          ],
        },
        {
          title: "Contact",
          body: [
            "For order or terms questions, contact support@verveacesports.com.",
          ],
        },
      ]}
    />
  );
}
