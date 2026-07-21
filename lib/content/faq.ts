export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  items: FaqItem[];
};

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
          "Orders over $75 USD (or the CAD equivalent shown at checkout) qualify for free standard shipping within the USA and Canada. Smaller orders display the shipping fee before you pay.",
      },
      {
        question: "When will my order arrive?",
        answer:
          "Most in-stock orders ship within 1–3 business days. Delivery times depend on your carrier and destination — you'll receive tracking information by email once your order ships.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "Contact us at support@verveacesports.com as soon as possible if you need to change your shipping address or cancel. We can usually help before the order ships; once it leaves our warehouse, changes may not be possible.",
      },
    ],
  },
  {
    title: "Returns & warranty",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "Unused items in original packaging may be returned within 30 days of delivery for a refund to your original payment method. Open-box or used gear may be eligible for store credit — email support@verveacesports.com with your order number to start a return.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Email support@verveacesports.com with your order number and the items you'd like to return. We'll send return instructions and a shipping label when applicable.",
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
        question: "Are you an authorized dealer?",
        answer:
          "Yes. VerveaceSports is an authorized retailer for BleeqUp AI camera glasses and MGI & Motocaddy electric golf trolleys, caddies, and accessories.",
      },
      {
        question: "Why do prices show in USD or CAD?",
        answer:
          "Prices display in USD for United States shoppers and CAD for Canadian shoppers based on your selected market. The currency shown on each product page and at checkout is the amount you'll be charged.",
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
          "Yes — enter your code on the checkout page before paying. Only one promo code applies per order. Codes must be active and meet any minimum order requirements shown in the promotion.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Email support@verveacesports.com with your order number and question. We typically respond within one business day.",
      },
    ],
  },
];
