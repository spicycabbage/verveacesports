import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How VerveaceSports collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2, 2025"
      intro="VerveaceSports (“we”, “us”) operates verveacesports.com. This policy explains what data we collect when you shop or create an account, and how we use it."
      sections={[
        {
          title: "Information we collect",
          body: [
            "Account data: name, email, and profile details you provide at sign-up or in your account settings.",
            "Order data: shipping address, items purchased, payment status, and order history. Card numbers are processed by Stripe — we do not store full payment credentials on our servers.",
            "Usage data: basic device and browser information collected through our hosting and analytics providers to keep the site secure and performant.",
            "Authentication: if you sign in with Google, we receive your email and basic profile from Google per their OAuth consent screen.",
          ],
        },
        {
          title: "How we use your information",
          body: [
            "To fulfill orders, calculate tax and shipping, send order confirmations, and provide customer support.",
            "To operate loyalty points, referral rewards, and promotional discounts you choose to apply.",
            "To prevent fraud, enforce our terms, and comply with legal obligations.",
            "We do not sell your personal information to third parties.",
          ],
        },
        {
          title: "Service providers",
          body: [
            "We use trusted processors including Stripe (payments), Supabase (database and authentication), and Vercel (hosting). They only receive data needed to perform their services.",
          ],
        },
        {
          title: "Cookies",
          body: [
            "We use essential cookies to keep you signed in and remember your cart and country preference. Referral codes may be stored in a short-lived cookie when you arrive via a referral link.",
          ],
        },
        {
          title: "Your choices",
          body: [
            "You may update profile details in Account → Profile, view orders in Account → Orders, and sign out at any time.",
            "You may request access, correction, or deletion of your account data by contacting support@verveacesports.com. We may retain certain records where required for tax, fraud prevention, or legal compliance.",
          ],
        },
        {
          title: "Children",
          body: [
            "Our store is not directed to children under 13. We do not knowingly collect personal information from children.",
          ],
        },
        {
          title: "Changes",
          body: [
            "We may update this policy from time to time. Material changes will be posted on this page with an updated date.",
          ],
        },
      ]}
    />
  );
}
