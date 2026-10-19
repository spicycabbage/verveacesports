import { SITES, type SiteId } from "@/lib/site/config";

export type FaqImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  images?: FaqImage[];
};

export type FaqSection = {
  title: string;
  items: FaqItem[];
};

function applyFaqTokens(text: string, siteId: SiteId): string {
  const site = SITES[siteId];
  return text
    .replaceAll("{{supportEmail}}", site.supportEmail)
    .replaceAll("{{freeShippingOver}}", String(site.freeShippingOver));
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Orders & shipping",
    items: [
      {
        question: "Where do you ship?",
        answer:
          "We ship to addresses in the United States and Canada. Shipping rates and estimated delivery times are calculated at checkout based on your location and order total.",
      },
      {
        question: "Is shipping free?",
        answer:
          "Orders of ${{freeShippingOver}} CAD or more qualify for free standard shipping within the USA and Canada. Smaller orders display the shipping fee before you pay.",
      },
      {
        question: "When will my order arrive?",
        answer:
          "Most in-stock orders ship within 1–3 business days. Delivery times depend on your carrier and destination — you'll receive tracking information by email once your order ships.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "Contact us at {{supportEmail}} as soon as possible if you need to change your shipping address or cancel. We can usually help before the order ships; once it leaves our warehouse, changes may not be possible.",
      },
    ],
  },
  {
    title: "Returns & warranty",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "Unused items in original packaging may be returned within 30 days of delivery for a refund to your original payment method. Open-box or used gear may be eligible for store credit — email {{supportEmail}} with your order number to start a return.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Email {{supportEmail}} with your order number and the items you'd like to return. We'll send return instructions and a shipping label when applicable.",
      },
      {
        question: "Are BleeqUp, MGI, and Motocaddy products covered by warranty?",
        answer:
          "Manufacturer warranties apply to eligible products. We're an authorized retailer for BleeqUp, MGI, and Motocaddy — contact us with your proof of purchase and we'll help coordinate warranty service with the brand when needed.",
      },
    ],
  },
  {
    title: "Products & pricing",
    items: [
      {
        question: "What do you sell?",
        answer:
          "VerveaceSports is a multi-brand sporting goods store. We sell BleeqUp Rover and Ranger AI sports camera glasses and accessories, the Volt Caddy Pro-S remote electric golf push cart, plus MGI and Motocaddy electric golf trolleys, caddies, and related golf gear.",
      },
      {
        question: "Are you an authorized dealer?",
        answer:
          "Yes. VerveaceSports is an authorized retailer for BleeqUp AI camera glasses and MGI & Motocaddy electric golf trolleys, caddies, and accessories. We are not the BleeqUp manufacturer website (bleequp.com).",
      },
      {
        question: "What BleeqUp glasses do you offer?",
        answer:
          "We carry BleeqUp Rover (ZEISS and Bundle, plus Rover Power Plus and Rover lenses) and BleeqUp Ranger (Standard Lens, Lenses by Zeiss, Ultimate Bundle) plus shared accessories such as Power Plus, Bluetooth Controller, Magnetic Charging Wire, swappable lenses, and a Prescription service. Open each product page for current variants and CAD pricing.",
      },
      {
        question: "Is this the same as BleeqUp Canada (ca.bleequp.com)?",
        answer:
          "No. VerveaceSports.com is our multi-brand USA & Canada store (BleeqUp + MGI + Motocaddy). BleeqUp Canada at ca.bleequp.com is a separate Canada-only BleeqUp storefront with CAD pricing. Orders and accounts are separate between the two sites.",
      },
      {
        question: "Why are prices in CAD?",
        answer:
          "Every price and checkout total is in Canadian dollars (CAD). You'll be charged in CAD regardless of shipping country.",
      },
      {
        question: "What if an item is out of stock?",
        answer:
          "Sold-out variants are marked on the product page. You can sign in and check back later, or contact us if you'd like help finding an alternative or estimating restock timing.",
      },
    ],
  },
  {
    title: "Account, loyalty & referrals",
    items: [
      {
        question: "Do I need an account to order?",
        answer:
          "You need a free account to complete checkout. Sign up with email or Google — your order history, loyalty balance, and saved profile details live under Account.",
      },
      {
        question: "How do loyalty points work?",
        answer:
          "Earn 1 point for every $1 spent on eligible purchases. Redeem 100 points for $1 off at checkout. View your balance and history under Account → Loyalty.",
      },
      {
        question: "How do referral rewards work?",
        answer:
          "Share your personal referral link from Account → Referrals. When a friend creates an account and completes a qualifying purchase, you both earn bonus loyalty points.",
      },
    ],
  },
  {
    title: "Payment & support",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept major credit and debit cards through Stripe. Your full card number is never stored on our servers.",
      },
      {
        question: "Can I use a promo code?",
        answer:
          "Yes — enter your code on the Your Cart page before checkout. Only one promo code applies per order. Codes must be active and meet any minimum order requirements shown in the promotion.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Email {{supportEmail}} with your order number and question. We typically respond within one business day.",
      },
    ],
  },
];

/** Canada-only BleeqUp storefront FAQ (CAD, ships Canada, Bleeq products only). */
export const BLEEQ_CA_FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Orders & shipping",
    items: [
      {
        question: "Where do you ship?",
        answer:
          "We ship to addresses in Canada only. Shipping rates and estimated delivery times are calculated at checkout based on your province and order total. All prices are in Canadian dollars (CAD).",
      },
      {
        question: "Is shipping free?",
        answer:
          "Orders of ${{freeShippingOver}} CAD or more qualify for free standard shipping within Canada. Smaller orders display the shipping fee before you pay.",
      },
      {
        question: "When will my order arrive?",
        answer:
          "Most in-stock orders ship within 1–3 business days. Delivery within Canada typically takes a few additional business days depending on your province and carrier. You'll get tracking by email once the order ships.",
      },
      {
        question: "Do you ship to the United States?",
        answer:
          "This storefront ships within Canada only. For USA shipping (and golf / other brands), shop at VerveaceSports.com.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "Email {{supportEmail}} as soon as possible with your order number if you need to change the shipping address or cancel. We can usually help before the order ships; once it leaves our warehouse, changes may not be possible.",
      },
      {
        question: "Do I pay duties or import fees?",
        answer:
          "Orders fulfilled for Canadian delivery are handled as domestic Canada shipments. The total you see at checkout in CAD is what you're charged — no surprise US-import duties on these orders.",
      },
    ],
  },
  {
    title: "Returns & warranty",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "Unused items in original packaging may be returned within 30 days of delivery for a refund to your original payment method. Open-box or used items may be eligible for store credit — email {{supportEmail}} with your order number to start a return.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Email {{supportEmail}} with your Canadian order number and the items you'd like to return. We'll send return instructions and a shipping label when applicable.",
      },
      {
        question: "Are BleeqUp products covered by warranty?",
        answer:
          "Yes — manufacturer warranties apply to eligible BleeqUp products. We're an authorized BleeqUp retailer for Canada. Contact us with your proof of purchase and we'll help coordinate warranty service with BleeqUp when needed.",
      },
    ],
  },
  {
    title: "Products & pricing",
    items: [
      {
        question: "What do you sell?",
        answer:
          "This is a dedicated BleeqUp Canada storefront. We sell BleeqUp Rover and Ranger AI sports camera glasses and official accessories (Power Plus, Rover Power Plus, Bluetooth controller, lenses, charging cable, prescription options, and related wearables). We do not sell golf carts or other brands on this site.",
      },
      {
        question: "What BleeqUp glasses do you offer?",
        answer:
          "We carry BleeqUp Rover (ZEISS and Bundle, plus Rover Power Plus and Rover lenses) and BleeqUp Ranger (Standard Lens, Lenses by Zeiss, Ultimate Bundle) plus accessories such as Power Plus, Bluetooth Controller, Magnetic Charging Wire, swappable lenses, and a Prescription service. Open each product page for current CAD pricing and variants.",
      },
      {
        question: "Are you an authorized BleeqUp retailer?",
        answer:
          "Yes. This site is operated as an authorized BleeqUp retailer for the Canadian market. It is not the official BleeqUp manufacturer website (bleequp.com).",
      },
      {
        question: "Is this the same as VerveaceSports.com?",
        answer:
          "No. ca.bleequp.com is BleeqUp Canada — BleeqUp products only, CAD, ships within Canada. VerveaceSports.com is a separate multi-brand store (BleeqUp + MGI + Motocaddy) that ships to the USA and Canada. Orders and accounts are separate.",
      },
      {
        question: "Why are prices in CAD?",
        answer:
          "This storefront is Canada-only. Every price and checkout total is in Canadian dollars (CAD). You'll be charged in CAD through our Canadian Stripe account.",
      },
      {
        question: "What if an item is out of stock?",
        answer:
          "Sold-out variants are marked on the product page. Sign in and check back later, or email {{supportEmail}} if you'd like help with an alternative or restock timing.",
      },
    ],
  },
  {
    title: "Account, loyalty & referrals",
    items: [
      {
        question: "Do I need an account to order?",
        answer:
          "Yes — a free account is required to complete checkout. Sign up with email or Google. Your Canadian orders, loyalty balance, and profile live under Account.",
      },
      {
        question: "How do loyalty points work?",
        answer:
          "Earn 1 point for every $1 CAD spent on eligible purchases. Redeem 100 points for $1 CAD off at checkout. View your balance under Account → Loyalty.",
      },
      {
        question: "How do referral rewards work?",
        answer:
          "Share your personal referral link from Account → Referrals. When a friend creates an account and completes a qualifying purchase on this storefront, you both earn bonus loyalty points.",
      },
    ],
  },
  {
    title: "Payment & support",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept major credit and debit cards through Stripe, charged in CAD. Your full card number is never stored on our servers.",
      },
      {
        question: "Can I use a promo code?",
        answer:
          "Yes — enter your code on the Your Cart page before checkout. Only one promo code applies per order. Codes must be active and meet any minimum order requirements shown in the promotion.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Email {{supportEmail}} with your order number and question. We typically respond within one business day. Mention that your order is from the BleeqUp Canada storefront so we can help faster.",
      },
    ],
  },
];

const VOLT_CA_FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Questions & Answers",
    items: [
      {
        question: "What is the alignment direction for the motor unit and pushcart?",
        answer:
          "When assembling the unit to the frame, the Volt logo must be facing upwards.",
        images: [
          {
            src: "/volt/qa/alignment.jpg",
            alt: "Motor unit mounted with the Volt logo facing up",
          },
        ],
      },
      {
        question: "How long can the remote controller be used continuously?",
        answer:
          "The AAA version can be used for 5–10 games. The rechargeable lithium battery version can be used for about 40 games after a full charge.",
      },
      {
        question: "How many games can the battery last after a full charge?",
        answer:
          "A full charge can cover three games on a regular course. Mountainous terrain and slope change that.",
      },
      {
        question: "How long does the battery take to charge?",
        answer: "About 3 to 3.5 hours for a full charge.",
      },
      {
        question: "What is the remote control distance?",
        answer:
          "The safe remote-control distance is 60 yards. In open, obstacle-free terrain it can extend past 80 yards. Keep the cart in line of sight. If slope or interference drops the signal, the cart locks until the signal returns.",
      },
      {
        question: "Can the clamps be adjusted for tightness?",
        answer:
          "Yes. Adjust them with a screwdriver while they are detached. Recheck tightness after several rounds so they do not loosen on a climb or after a bump.",
      },
      {
        question: "Should I fold and store the frame without removing the support wheel?",
        answer:
          "No. Leaving the support wheel on can damage the wheel or press on non-metal parts.",
        images: [
          {
            src: "/volt/qa/fold-support-wheel.png",
            alt: "Fold the frame only after the support wheel is removed",
          },
        ],
      },
      {
        question: "How do I power the remote controller on and off?",
        answer:
          "Press the power button twice to turn it on. Press and hold the power button for 10 seconds to turn it off.",
      },
      {
        question: "How do I re-pair the remote after it loses connection?",
        answer:
          "Within ten seconds of turning the unit on, press and hold the M button and the square button together. A flashing light on the battery display means pairing succeeded.",
        images: [
          {
            src: "/volt/qa/repair-remote.png",
            alt: "Remote buttons used to re-pair: M and the square button",
          },
          {
            src: "/volt/qa/battery-recommended.jpg",
            alt: "Recommended remote-control battery",
            caption: "Recommended battery for the remote.",
          },
          {
            src: "/volt/qa/battery-not-recommended.png",
            alt: "Battery that should not be used in the remote",
            caption: "Do not use this battery in the remote.",
          },
        ],
      },
      {
        question: "What does the lightning light on the motor unit mean?",
        answer:
          "It shows battery level. The reading can drop quickly on a steep climb or under load, then recover on flat ground. Consumption also rises as voltage falls.",
      },
      {
        question: "What is the warranty period?",
        answer: "The cart has a 2-year warranty. The battery has a 1-year warranty.",
      },
      {
        question: "What slope can it climb?",
        answer:
          "Up to 30 degrees, using the two 180W motors.",
      },
      {
        question: "Does the battery need charging during winter storage?",
        answer:
          "Store the battery at room temperature and charge it every three months. Lithium packs, remote or main battery, should be charged at least once every 90 days when they are not in use.",
      },
    ],
  },
];

export function faqSectionsForSite(siteId: SiteId): FaqSection[] {
  let sections: FaqSection[];
  switch (siteId) {
    case "bleeq-ca":
      sections = BLEEQ_CA_FAQ_SECTIONS;
      break;
    case "volt-ca":
      sections = VOLT_CA_FAQ_SECTIONS;
      break;
    case "verveace":
      sections = FAQ_SECTIONS;
      break;
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      answer: applyFaqTokens(item.answer, siteId),
    })),
  }));
}
