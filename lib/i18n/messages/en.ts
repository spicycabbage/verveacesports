import type { Dictionary } from "./types";

export const en: Dictionary = {
  nav: {
    openMenu: "Open menu",
    menu: "Menu",
    language: "Language",
    allProducts: "All products",
    cart: "Cart",
    account: "Account",
    orders: "Orders",
    faq: "FAQ",
    searchPlaceholder: "Search gear...",
    signIn: "Sign in",
    signOut: "Sign out",
    profile: "Profile",
    loyaltyPoints: "Loyalty Points",
    referrals: "Referrals",
    admin: "Admin",
    pts: "{n} pts",
    accountMenu: "Account menu",
    openCart: "Open cart",
  },

  footer: {
    tagline:
      "Authorized retailer for BleeqUp AI camera glasses and MGI & Motocaddy electric golf trolleys.",
    shop: "Shop",
    account: "Account",
    help: "Help",
    profile: "Profile",
    orders: "Orders",
    loyaltyPoints: "Loyalty Points",
    referFriend: "Refer a Friend",
    freeShippingOver: "Free shipping ${amount}+",
    freeReturns30: "Free returns within 30 days",
    earn1Point: "Earn 1 point per dollar",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    warranty: "Warranty",
    privacy: "Privacy",
    terms: "Terms",
    themePlayground: "Theme playground",
    faq: "FAQ",
    copyright: "© {year} VerveaceSports. All rights reserved.",
  },

  home: {
    shopByCategory: "Shop by category",
    viewAll: "View all",
    featured: "Featured",
    seeAll: "See all",
    badge: "BleeqUp, MGI & Motocaddy — ships USA & Canada",
    headlineGlasses: "Capture Every Moment",
    headlineCart: "Power Every Round",
    ctaGlasses: "Shop AI Glasses",
    ctaCarts: "Shop Golf Carts",
    ctaAll: "Shop All Products",
    altGlasses: "BleeqUp Ranger AI sports camera glasses",
    altCart: "MGI Zip X5 electric golf trolley",
    subcopy:
      "Shop BleeqUp Ranger AI sports camera glasses and premium electric golf carts from MGI and Motocaddy. Free shipping across Canada on orders over ${amount}.",
    trustShipping: "Free shipping ${amount}+",
    trustReturns: "30-day returns",
    trustLoyalty: "Loyalty rewards",
  },

  categories: {
    "ai-glasses": "AI Glasses",
    wearables: "Wearables",
    "electric-carts": "Electric Carts",
    "golf-gear": "Golf Gear",
  },

  products: {
    allProducts: "All products",
    shopAllTitle: "Shop all products",
    count: "{n} products",
    countForQuery: '{n} products for "{query}"',
    empty: "No products found.",
    youMightAlsoLike: "You might also like",
    sortNewest: "Newest",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortNameAsc: "Name A–Z",
    searching: "Searching:",
    clearSearch: "Clear search",
    all: "All",
    shopRanger: "Shop Ranger",
    rangerMeta:
      "{n} models available · Free returns within 30 days · Earn 1 loyalty point per dollar",
  },

  product: {
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    soldOut: "Sold out",
    onlyNLeft: "Only {n} left",
    inStock: "In stock",
    freeShippingOver: "Free shipping on orders over ${amount}",
    freeShippingCanada: "Free shipping on orders over ${amount} (Canada)",
    freeShippingUsaCa: "Free shipping on orders over ${amount} (USA & CA)",
    returns30: "30-day hassle-free returns",
    earnPoints: "Earn {n} points on this order",
    addedToast: "{name} added to cart",
    viewCart: "View cart",
    reviews: {
      heading: "Customer reviews",
      writeReview: "Write a review",
      cancel: "Cancel",
      rating: "Rating",
      reviewTitle: "Title",
      titleOptional: "Title (optional)",
      titlePlaceholder: "Sum it up",
      reviewBody: "Review",
      bodyPlaceholder: "What did you like? How's it holding up?",
      submitReview: "Submit review",
      submitting: "Submitting…",
      noReviews: "No reviews yet.",
      signInToReview: "Sign in",
      signIn: "Sign in",
      afterPurchase: "after purchasing to leave a verified review.",
      alreadyReviewed: "You already reviewed this product.",
      verifiedOnly: "Reviews are limited to verified buyers of this product.",
      verifiedBuyer: "Verified buyer",
      thanksReview: "Thanks — your review is live",
      reviewSingular: "review",
      reviewPlural: "reviews",
    },
  },

  cart: {
    title: "Your Cart",
    empty: "Your cart is empty",
    emptyHint: "Discover gear that pushes your performance.",
    browseProducts: "Browse products",
    remove: "Remove",
    removeItem: "Remove item",
    subtotal: "Subtotal",
    discount: "Discount",
    estimatedTotal: "Estimated total",
    shipping: "Shipping",
    shippingCalc: "Calculated at checkout",
    orderSummary: "Order summary",
    proceedCheckout: "Proceed to checkout",
    checkout: "Checkout",
    shippingTaxesNote: "Shipping & taxes calculated at checkout.",
    emptyDiscover: "Discover gear that pushes your performance.",
  },

  checkout: {
    title: "Checkout",
    empty: "Your cart is empty",
    browseProducts: "Browse products",
    shippingAddress: "Shipping address",
    firstName: "First name",
    lastName: "Last name",
    address: "Address",
    aptOptional: "Apt / Suite (optional)",
    city: "City",
    stateProvince: "State / Province",
    postalCode: "Postal code",
    country: "Country",
    unitedStates: "United States",
    canada: "Canada",
    promo: "Promo code",
    noPromo: "No promo applied.",
    addPromoOnCart: "Add one on Your Cart",
    youSave: "You save {amount}",
    freeShippingIncluded: "Free shipping included",
    remove: "Remove",
    redeemPoints: "Redeem loyalty points",
    pointsAvailable: "You have {n} pts. 100 pts = $1 off.",
    redeemN: "Redeem {n} pts",
    payment: "Payment",
    payForOrder: "Pay for order",
    cadNotConfigured:
      "Canadian payments aren't configured yet. Refresh in a minute — if this persists, contact support.",
    currencyNotConfigured: "Payments aren't configured for this currency yet. Contact support.",
    calculating: "Calculating total…",
    belowMinimum: "Order total is below the minimum charge.",
    orderSummary: "Order summary",
    subtotal: "Subtotal",
    discount: "Discount",
    discountWithCode: "Discount ({code})",
    shipping: "Shipping",
    shippingPromo: "Shipping (promo)",
    tax: "Tax",
    taxWithRate: "Tax ({rate}%)",
    points: "Points ({n})",
    total: "Total",
    free: "FREE",
    enterRegionForTax: "Enter state/province for tax estimate.",
    earnPointsNote: "You'll earn ~{n} pts on this order.",
    completeShipping: "Please complete the shipping form.",
    couldNotUpdate: "Could not update totals",
    promoRemoved: "Promo removed",
    successConfirmed: "Order confirmed",
    thankYou: "Thank you for your order!",
    viewOrder: "View order",
    keepShopping: "Keep shopping",
    paymentReceived:
      "Payment received. Loyalty points for this order will show in your account shortly.",
    confirmingPayment:
      "We're confirming payment with Stripe — this usually takes a few seconds.",
    totalPaid: "Total paid",
    pointsRedeemed: "Points redeemed",
  },

  account: {
    title: "Account",
    profile: "Profile",
    orders: "Orders",
    loyalty: "Loyalty",
    referrals: "Referrals",
    admin: "Admin",
    signOut: "Sign out",
    loyaltyPoints: "Loyalty points",
    worthAtCheckout: "Worth ${amount} at checkout",
    memberSince: "Member since",
    profileTitle: "Profile",
    profileDesc: "Keep your details up to date.",
    email: "Email",
    yourReferralCode: "Your referral code",
    firstName: "First name",
    lastName: "Last name",
    country: "Country",
    saveChanges: "Save changes",
    profileUpdated: "Profile updated",
    ordersTitle: "My orders",
    noOrders: "No orders yet",
    startShopping: "Start shopping",
    order: "Order",
    date: "Date",
    status: "Status",
    total: "Total",
    view: "View",
    loyaltyTitle: "Loyalty points",
    loyaltyDesc: "Earn 1 point per dollar. Redeem 100 points for $1 off at checkout.",
    referralsTitle: "Refer a friend",
    referralsDesc:
      "Share your link. When a friend completes a qualifying purchase, you both earn bonus points.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    status_pending: "pending",
    status_paid: "paid",
    status_shipped: "shipped",
    status_delivered: "delivered",
    status_cancelled: "cancelled",
  },

  auth: {
    welcomeBack: "Welcome back",
    signInDesc: "Sign in to your VerveaceSports account.",
    continueGoogle: "Continue with Google",
    or: "OR",
    password: "Password",
    email: "Email",
    signIn: "Sign in",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    createAccount: "Create account",
    createTitle: "Create your account",
    createDesc: "Earn 1 point per dollar from your first order.",
    alreadyHave: "Already have an account?",
    min8: "Min 8 characters.",
    firstName: "First name",
    lastName: "Last name",
    referredBy: "Referred by {code}",
    referralBonus: "Both of you earn 100 bonus points after your first paid order.",
    agreeTerms: "By creating an account you agree to our",
    terms: "Terms",
    and: "and",
    privacyPolicy: "Privacy Policy",
    signedIn: "Signed in",
    checkEmailConfirm: "Check your email to confirm your account.",
  },

  faq: {
    title: "Frequently asked questions",
    home: "Home",
    introVerveace:
      "Quick answers about shipping, returns, BleeqUp, MGI & Motocaddy products, loyalty points, and checkout. Can't find what you need? Email {email}.",
    introBleeq:
      "Quick answers about Canadian shipping, CAD pricing, returns, BleeqUp Ranger glasses, loyalty, and checkout. Can't find what you need? Email {email}.",
    emailSupport: "Email {email} for more help.",
    sections: {
      ordersShipping: {
        title: "Orders & shipping",
        items: [
          {
            q: "Where do you ship?",
            a: "We ship to addresses in the United States and Canada. Shipping rates and estimated delivery times are calculated at checkout based on your location and order total.",
          },
          {
            q: "Is shipping free?",
            a: "Orders of ${freeShippingOver} USD or more (or ${freeShippingOver} CAD for Canadian checkout) qualify for free standard shipping within the USA and Canada. Smaller orders display the shipping fee before you pay.",
          },
          {
            q: "When will my order arrive?",
            a: "Most in-stock orders ship within 1–3 business days. Delivery times depend on your carrier and destination — you'll receive tracking information by email once your order ships.",
          },
          {
            q: "Can I change or cancel my order?",
            a: "Contact us at {supportEmail} as soon as possible if you need to change your shipping address or cancel. We can usually help before the order ships; once it leaves our warehouse, changes may not be possible.",
          },
        ],
      },
      returnsWarranty: {
        title: "Returns & warranty",
        items: [
          {
            q: "What is your return policy?",
            a: "Unused items in original packaging may be returned within 30 days of delivery for a refund to your original payment method. Open-box or used gear may be eligible for store credit — email {supportEmail} with your order number to start a return.",
          },
          {
            q: "How do I start a return?",
            a: "Email {supportEmail} with your order number and the items you'd like to return. We'll send return instructions and a shipping label when applicable.",
          },
          {
            q: "Are BleeqUp, MGI, and Motocaddy products covered by warranty?",
            a: "Manufacturer warranties apply to eligible products. We're an authorized retailer for BleeqUp, MGI, and Motocaddy — contact us with your proof of purchase and we'll help coordinate warranty service with the brand when needed.",
          },
        ],
      },
      productsPricing: {
        title: "Products & pricing",
        items: [
          {
            q: "Are you an authorized dealer?",
            a: "Yes. VerveaceSports is an authorized retailer for BleeqUp AI camera glasses and MGI & Motocaddy electric golf trolleys, caddies, and accessories.",
          },
          {
            q: "Why do prices show in USD or CAD?",
            a: "Prices display in USD for United States shoppers and CAD for Canadian shoppers based on your selected market. The currency shown on each product page and at checkout is the amount you'll be charged.",
          },
          {
            q: "What if an item is out of stock?",
            a: "Sold-out variants are marked on the product page. You can sign in and check back later, or contact us if you'd like help finding an alternative or estimating restock timing.",
          },
        ],
      },
      accountLoyalty: {
        title: "Account, loyalty & referrals",
        items: [
          {
            q: "Do I need an account to order?",
            a: "You need a free account to complete checkout. Sign up with email or Google — your order history, loyalty balance, and saved profile details live under Account.",
          },
          {
            q: "How do loyalty points work?",
            a: "Earn 1 point for every $1 spent on eligible purchases. Redeem 100 points for $1 off at checkout. View your balance and history under Account → Loyalty.",
          },
          {
            q: "How do referral rewards work?",
            a: "Share your personal referral link from Account → Referrals. When a friend creates an account and completes a qualifying purchase, you both earn bonus loyalty points.",
          },
        ],
      },
      paymentSupport: {
        title: "Payment & support",
        items: [
          {
            q: "What payment methods do you accept?",
            a: "We accept major credit and debit cards through Stripe. Your full card number is never stored on our servers.",
          },
          {
            q: "Can I use a promo code?",
            a: "Yes — enter your code on the Your Cart page before checkout. Only one promo code applies per order. Codes must be active and meet any minimum order requirements shown in the promotion.",
          },
          {
            q: "How do I contact support?",
            a: "Email {supportEmail} with your order number and question. We typically respond within one business day.",
          },
        ],
      },
    },
    bleeqSections: {
      ordersShipping: {
        title: "Orders & shipping",
        items: [
          {
            q: "Where do you ship?",
            a: "We ship to addresses in Canada only. Shipping rates and estimated delivery times are calculated at checkout based on your province and order total. All prices are in Canadian dollars (CAD).",
          },
          {
            q: "Is shipping free?",
            a: "Orders of ${freeShippingOver} CAD or more qualify for free standard shipping within Canada. Smaller orders display the shipping fee before you pay.",
          },
          {
            q: "When will my order arrive?",
            a: "Most in-stock orders ship within 1–3 business days. Delivery within Canada typically takes a few additional business days depending on your province and carrier. You'll get tracking by email once the order ships.",
          },
          {
            q: "Do you ship to the United States?",
            a: "This storefront ships within Canada only. For USA shipping (and golf / other brands), shop at VerveaceSports.com.",
          },
          {
            q: "Can I change or cancel my order?",
            a: "Email {supportEmail} as soon as possible with your order number if you need to change the shipping address or cancel. We can usually help before the order ships; once it leaves our warehouse, changes may not be possible.",
          },
          {
            q: "Do I pay duties or import fees?",
            a: "Orders fulfilled for Canadian delivery are handled as domestic Canada shipments. The total you see at checkout in CAD is what you're charged — no surprise US-import duties on these orders.",
          },
        ],
      },
      returnsWarranty: {
        title: "Returns & warranty",
        items: [
          {
            q: "What is your return policy?",
            a: "Unused items in original packaging may be returned within 30 days of delivery for a refund to your original payment method. Open-box or used items may be eligible for store credit — email {supportEmail} with your order number to start a return.",
          },
          {
            q: "How do I start a return?",
            a: "Email {supportEmail} with your Canadian order number and the items you'd like to return. We'll send return instructions and a shipping label when applicable.",
          },
          {
            q: "Are BleeqUp products covered by warranty?",
            a: "Yes — manufacturer warranties apply to eligible BleeqUp products. We're an authorized BleeqUp retailer for Canada. Contact us with your proof of purchase and we'll help coordinate warranty service with BleeqUp when needed.",
          },
        ],
      },
      productsPricing: {
        title: "Products & pricing",
        items: [
          {
            q: "What do you sell?",
            a: "This is a dedicated BleeqUp Canada storefront. We sell BleeqUp Ranger AI sports camera glasses and official accessories (Power Plus, Bluetooth controller, lenses, charging cable, prescription options, and related wearables). We do not sell golf carts or other brands on this site.",
          },
          {
            q: "Are you an authorized BleeqUp retailer?",
            a: "Yes. This site is operated as an authorized BleeqUp retailer for the Canadian market. It is not the official BleeqUp manufacturer website (bleequp.com).",
          },
          {
            q: "Why are prices in CAD?",
            a: "This storefront is Canada-only. Every price and checkout total is in Canadian dollars (CAD). You'll be charged in CAD through our Canadian Stripe account.",
          },
          {
            q: "What if an item is out of stock?",
            a: "Sold-out variants are marked on the product page. Sign in and check back later, or email {supportEmail} if you'd like help with an alternative or restock timing.",
          },
        ],
      },
      accountLoyalty: {
        title: "Account, loyalty & referrals",
        items: [
          {
            q: "Do I need an account to order?",
            a: "Yes — a free account is required to complete checkout. Sign up with email or Google. Your Canadian orders, loyalty balance, and profile live under Account.",
          },
          {
            q: "How do loyalty points work?",
            a: "Earn 1 point for every $1 CAD spent on eligible purchases. Redeem 100 points for $1 CAD off at checkout. View your balance under Account → Loyalty.",
          },
          {
            q: "How do referral rewards work?",
            a: "Share your personal referral link from Account → Referrals. When a friend creates an account and completes a qualifying purchase on this storefront, you both earn bonus loyalty points.",
          },
        ],
      },
      paymentSupport: {
        title: "Payment & support",
        items: [
          {
            q: "What payment methods do you accept?",
            a: "We accept major credit and debit cards through Stripe, charged in CAD. Your full card number is never stored on our servers.",
          },
          {
            q: "Can I use a promo code?",
            a: "Yes — enter your code on the Your Cart page before checkout. Only one promo code applies per order. Codes must be active and meet any minimum order requirements shown in the promotion.",
          },
          {
            q: "How do I contact support?",
            a: "Email {supportEmail} with your order number and question. We typically respond within one business day. Mention that your order is from the BleeqUp Canada storefront so we can help faster.",
          },
        ],
      },
    },
  },

  legal: {
    home: "Home",
    lastUpdated: "Last updated {date}",
    questionsEmail: "Questions? Email",
    privacy: {
      title: "Privacy Policy",
      metaDesc: "How {name} collects, uses, and protects your personal information.",
      updated: "June 2, 2025",
      intro:
        "{name} (“we”, “us”) operates {host}. This policy explains what data we collect when you shop or create an account, and how we use it.",
      sections: [
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
            "You may request access, correction, or deletion of your account data by contacting {supportEmail}. We may retain certain records where required for tax, fraud prevention, or legal compliance.",
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
            "We may update this policy from time to time. Continued use of the site after changes constitutes acceptance of the revised policy.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      metaDesc: "Terms and conditions for shopping at {name}.",
      updated: "June 2, 2025",
      intro:
        "By using {host} or placing an order, you agree to these terms. Please read them before purchasing.",
      sections: [
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
            "Free shipping applies on orders of ${freeShippingOver} or more (order currency), and return windows described on the site apply, unless otherwise stated on your order confirmation.",
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
          body: ["For order or terms questions, contact {supportEmail}."],
        },
      ],
      productsPricingVerveace:
        "Prices are shown in USD or CAD based on your selected country. Taxes and shipping are calculated at checkout.",
      productsPricingBleeq: "Prices are shown in CAD. Taxes and shipping are calculated at checkout.",
      shippingBodyVerveace:
        "We ship to addresses in the United States and Canada. Delivery times are estimates, not guarantees.",
      shippingBodyBleeq: "We ship to addresses in Canada. Delivery times are estimates, not guarantees.",
      governingLawVerveace:
        "These terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law rules. Disputes will be resolved in courts located in Delaware, unless your local consumer laws require otherwise.",
      governingLawBleeq:
        "These terms are governed by the laws of Canada and the province of Ontario, without regard to conflict-of-law rules, unless your local consumer laws require otherwise.",
    },
    warranty: {
      title: "Warranty",
      metaDesc: "Warranty policy and product registration for {name}.",
      tabPolicy: "Warranty Policy",
      tabRegister: "Warranty Registration",
      registerIntro:
        "Register your product to help us verify ownership and speed up future warranty claims. Keep your order confirmation handy — serial number is optional but recommended for camera glasses.",
      fullName: "Full name",
      email: "Email",
      orderNumber: "Order number",
      orderNumberPlaceholder: "e.g. ORD-12345",
      product: "Product",
      productPlaceholder: "Select a product",
      serialNumber: "Serial number",
      purchaseDate: "Purchase date",
      notes: "Notes",
      notesPlaceholder: "Anything else we should know?",
      optional: "optional",
      submit: "Register product",
      submitting: "Submitting…",
      successTitle: "Registration received",
      successBody:
        "Thanks — we’ve saved your warranty registration. Keep your order confirmation for any future claims. We’ll email you if we need more details.",
      toastSuccess: "Warranty registration submitted.",
      errorProduct: "Select a product",
      errorGeneric: "Something went wrong. Try again.",
      errorConn: "Could not submit. Check your connection and try again.",
    },
  },

  newsletter: {
    title: "Stay in the loop",
    descVerveace:
      "Get BleeqUp drops, exclusive deals, and new product alerts from VerveaceSports.",
    descBleeq:
      "Join our Newsletter for a chance to win a FREE pair of Bleequp Rangers AI Glasses",
    email: "Email address",
    emailPlaceholder: "you@example.com",
    subscribe: "Subscribe",
    subscribing: "Subscribing…",
    privacyNote: "Unsubscribe anytime. See our",
    privacyPolicy: "Privacy Policy",
    noThanks: "No thanks",
    toastSuccess: "You're subscribed. Watch your inbox for updates.",
    toastAlready: "You're already on the list — thanks!",
    toastError: "Something went wrong. Try again.",
    toastConnError: "Could not subscribe. Check your connection and try again.",
  },

  draw: {
    title: "NBDA Draw",
    metaDescription:
      "Subscribe to enter a draw for a free pair of BleeqUp Ranger AI glasses. Use code NBDA2026 for 10% off.",
    kicker: "NBDA Canada 2026",
    headline: "Win a free pair of BleeqUp AI Glasses",
    subhead:
      "Join our newsletter to enter the draw for a free pair of BleeqUp Ranger AI Sports Glasses — and unlock our NBDA promo while you’re shopping.",
    promoTitle: "Ongoing promo",
    promoBody:
      "Use code NBDA2026 for 10% off. Free shipping on orders over ${amount}.",
    promoCode: "NBDA2026",
    howTitle: "How to enter",
    step1: "Enter your email to subscribe to the BleeqUp Canada newsletter.",
    step2:
      "You’re automatically entered into the draw for a free pair of BleeqUp Ranger AI Sports Glasses.",
    step3: "Shop anytime with code NBDA2026 for 10% off your order.",
    formTitle: "Enter the draw",
    formSubtitle: "One email = newsletter updates + draw entry.",
    cta: "Subscribe & enter",
    entered: "You’re in — watch your inbox for updates and draw news.",
    toastSuccess: "You’re entered. Watch your inbox for updates.",
    finePrint: "No purchase necessary. See our",
    navLabel: "Draw",
  },

  bleeq: {
    trust: {
      promo: "Use Code NBDA2026 for 10% off",
      promoDesktop:
        "Use Code NBDA2026 for 10% off. Free shipping for orders over ${amount}.",
    },
    header: {
      shopRanger: "Shop Ranger",
      accessories: "Accessories",
      support: "Support",
      faq: "FAQ",
      allProducts: "All products",
      supportFaq: "Support / FAQ",
      viewAllModels: "View all Ranger models →",
      allAccessories: "All accessories →",
      canada: "Canada",
    },
    footer: {
      blurb: "Authorized BleeqUp retailer. CAD pricing, ships across Canada.",
      shopRanger: "Shop Ranger",
      allModels: "All models",
      accessories: "Accessories",
      support: "Support",
      shipsCad: "Ships Canada · CAD",
      copyright: "© {year} {name}. Authorized BleeqUp retailer.",
    },
    home: {
      heroKicker: "{shortName} · Canada · CAD",
      shopNow: "Shop now",
      compareModels: "Compare models",
      chooseTitle: "Choose your Ranger",
      chooseSubtitle: "Standard, Zeiss, or Ultimate Bundle — one click to the product.",
      viewAll: "View all →",
      featuresKicker: "Product features",
      featuresTitle: "See what Ranger can do",
      watchMore: "Watch more on the shop page",
      testimonialsKicker: "Customers are saying",
      testimonialsTitle: "Built for how you move",
      asSeenIn: "As seen in",
      accessoriesTitle: "Accessories",
      accessoriesSubtitle: "Power Plus, controllers, lenses, and more.",
      shopAccessories: "Shop accessories →",
      ctaTitle: "Ready for your next ride?",
      ctaSubtitle:
        "Authorized BleeqUp retailer for Canada. Free returns within 30 days. Earn loyalty points on every order.",
      shopRanger: "Shop Ranger",
    },
  },

  common: {
    remove: "Remove",
    cancel: "Cancel",
    apply: "Apply",
    copy: "Copy",
    copied: "Copied",
    share: "Share",
    loading: "Loading…",
    language: "Language",
    free: "Free",
    home: "Home",
    save: "Save",
    close: "Close",
    error: "Something went wrong.",
  },
};
