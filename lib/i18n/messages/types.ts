/**
 * Message dictionary contract for the storefront.
 *
 * English (`en.ts`) is the source of truth; every locale file must satisfy this
 * exact shape. Use `{var}` placeholders for runtime interpolation (see
 * `lib/i18n/dictionary.ts`).
 */

export type FaqQa = {
  q: string;
  a: string;
};

export type FaqSectionMessages = {
  title: string;
  items: FaqQa[];
};

export type FaqSectionsMessages = {
  ordersShipping: FaqSectionMessages;
  returnsWarranty: FaqSectionMessages;
  productsPricing: FaqSectionMessages;
  accountLoyalty: FaqSectionMessages;
  paymentSupport: FaqSectionMessages;
};

export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalDoc = {
  title: string;
  metaDesc: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export type Dictionary = {
  nav: {
    openMenu: string;
    menu: string;
    language: string;
    allProducts: string;
    cart: string;
    account: string;
    orders: string;
    faq: string;
    searchPlaceholder: string;
    signIn: string;
    signOut: string;
    profile: string;
    loyaltyPoints: string;
    referrals: string;
    admin: string;
    pts: string;
    accountMenu: string;
    openCart: string;
  };

  footer: {
    tagline: string;
    shop: string;
    account: string;
    help: string;
    profile: string;
    orders: string;
    loyaltyPoints: string;
    referFriend: string;
    freeShippingOver: string;
    freeReturns30: string;
    earn1Point: string;
    privacyPolicy: string;
    termsOfService: string;
    warranty: string;
    privacy: string;
    terms: string;
    themePlayground: string;
    faq: string;
    copyright: string;
  };

  home: {
    shopByCategory: string;
    viewAll: string;
    featured: string;
    seeAll: string;
    badge: string;
    headlineGlasses: string;
    headlineCart: string;
    ctaGlasses: string;
    ctaCarts: string;
    ctaAll: string;
    altGlasses: string;
    altCart: string;
    subcopy: string;
    trustShipping: string;
    trustReturns: string;
    trustLoyalty: string;
  };

  categories: {
    "ai-glasses": string;
    wearables: string;
    "electric-carts": string;
    "golf-gear": string;
  };

  products: {
    allProducts: string;
    shopAllTitle: string;
    count: string;
    countForQuery: string;
    empty: string;
    youMightAlsoLike: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortNameAsc: string;
    searching: string;
    clearSearch: string;
    all: string;
    shopRanger: string;
    rangerMeta: string;
  };

  product: {
    addToCart: string;
    outOfStock: string;
    soldOut: string;
    onlyNLeft: string;
    inStock: string;
    freeShippingOver: string;
    freeShippingCanada: string;
    freeShippingUsaCa: string;
    returns30: string;
    earnPoints: string;
    addedToast: string;
    viewCart: string;
    reviews: {
      heading: string;
      writeReview: string;
      cancel: string;
      rating: string;
      reviewTitle: string;
      titleOptional: string;
      titlePlaceholder: string;
      reviewBody: string;
      bodyPlaceholder: string;
      submitReview: string;
      submitting: string;
      noReviews: string;
      signInToReview: string;
      signIn: string;
      afterPurchase: string;
      alreadyReviewed: string;
      verifiedOnly: string;
      verifiedBuyer: string;
      thanksReview: string;
      reviewSingular: string;
      reviewPlural: string;
    };
  };

  cart: {
    title: string;
    empty: string;
    emptyHint: string;
    browseProducts: string;
    remove: string;
    removeItem: string;
    subtotal: string;
    discount: string;
    estimatedTotal: string;
    shipping: string;
    shippingCalc: string;
    orderSummary: string;
    proceedCheckout: string;
    checkout: string;
    shippingTaxesNote: string;
    emptyDiscover: string;
  };

  checkout: {
    title: string;
    empty: string;
    browseProducts: string;
    shippingAddress: string;
    firstName: string;
    lastName: string;
    address: string;
    aptOptional: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    unitedStates: string;
    canada: string;
    promo: string;
    noPromo: string;
    addPromoOnCart: string;
    youSave: string;
    freeShippingIncluded: string;
    remove: string;
    redeemPoints: string;
    pointsAvailable: string;
    redeemN: string;
    payment: string;
    payForOrder: string;
    cadNotConfigured: string;
    currencyNotConfigured: string;
    calculating: string;
    belowMinimum: string;
    orderSummary: string;
    subtotal: string;
    discount: string;
    discountWithCode: string;
    shipping: string;
    shippingPromo: string;
    tax: string;
    taxWithRate: string;
    points: string;
    total: string;
    free: string;
    enterRegionForTax: string;
    earnPointsNote: string;
    completeShipping: string;
    couldNotUpdate: string;
    promoRemoved: string;
    successConfirmed: string;
    thankYou: string;
    viewOrder: string;
    keepShopping: string;
    paymentReceived: string;
    confirmingPayment: string;
    totalPaid: string;
    pointsRedeemed: string;
  };

  account: {
    title: string;
    profile: string;
    orders: string;
    loyalty: string;
    referrals: string;
    admin: string;
    signOut: string;
    loyaltyPoints: string;
    worthAtCheckout: string;
    memberSince: string;
    profileTitle: string;
    profileDesc: string;
    email: string;
    yourReferralCode: string;
    firstName: string;
    lastName: string;
    country: string;
    saveChanges: string;
    profileUpdated: string;
    ordersTitle: string;
    noOrders: string;
    startShopping: string;
    order: string;
    date: string;
    status: string;
    total: string;
    view: string;
    loyaltyTitle: string;
    loyaltyDesc: string;
    referralsTitle: string;
    referralsDesc: string;
    copyLink: string;
    linkCopied: string;
    status_pending: string;
    status_paid: string;
    status_shipped: string;
    status_delivered: string;
    status_cancelled: string;
  };

  auth: {
    welcomeBack: string;
    signInDesc: string;
    continueGoogle: string;
    or: string;
    password: string;
    email: string;
    signIn: string;
    noAccount: string;
    signUp: string;
    createAccount: string;
    createTitle: string;
    createDesc: string;
    alreadyHave: string;
    min8: string;
    firstName: string;
    lastName: string;
    referredBy: string;
    referralBonus: string;
    agreeTerms: string;
    terms: string;
    and: string;
    privacyPolicy: string;
    signedIn: string;
    checkEmailConfirm: string;
  };

  faq: {
    title: string;
    home: string;
    introVerveace: string;
    introBleeq: string;
    emailSupport: string;
    sections: FaqSectionsMessages;
    bleeqSections: FaqSectionsMessages;
  };

  legal: {
    home: string;
    lastUpdated: string;
    questionsEmail: string;
    privacy: LegalDoc;
    terms: LegalDoc & {
      productsPricingVerveace: string;
      productsPricingBleeq: string;
      shippingBodyVerveace: string;
      shippingBodyBleeq: string;
      governingLawVerveace: string;
      governingLawBleeq: string;
    };
    warranty: {
      title: string;
      metaDesc: string;
      tabPolicy: string;
      tabRegister: string;
      registerIntro: string;
      fullName: string;
      email: string;
      orderNumber: string;
      orderNumberPlaceholder: string;
      product: string;
      productPlaceholder: string;
      serialNumber: string;
      purchaseDate: string;
      notes: string;
      notesPlaceholder: string;
      optional: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      toastSuccess: string;
      errorProduct: string;
      errorGeneric: string;
      errorConn: string;
    };
  };

  newsletter: {
    title: string;
    descVerveace: string;
    descBleeq: string;
    email: string;
    emailPlaceholder: string;
    subscribe: string;
    subscribing: string;
    privacyNote: string;
    privacyPolicy: string;
    noThanks: string;
    toastSuccess: string;
    toastAlready: string;
    toastError: string;
    toastConnError: string;
  };

  draw: {
    title: string;
    metaDescription: string;
    kicker: string;
    headline: string;
    subhead: string;
    promoTitle: string;
    promoBody: string;
    promoCode: string;
    howTitle: string;
    step1: string;
    step2: string;
    step3: string;
    formTitle: string;
    formSubtitle: string;
    cta: string;
    entered: string;
    toastSuccess: string;
    finePrint: string;
    navLabel: string;
  };

  bleeq: {
    trust: {
      promo: string;
      promoDesktop: string;
    };
    header: {
      shopRanger: string;
      accessories: string;
      support: string;
      faq: string;
      allProducts: string;
      supportFaq: string;
      viewAllModels: string;
      allAccessories: string;
      canada: string;
    };
    footer: {
      blurb: string;
      shopRanger: string;
      allModels: string;
      accessories: string;
      support: string;
      shipsCad: string;
      copyright: string;
    };
    home: {
      heroKicker: string;
      shopNow: string;
      compareModels: string;
      chooseTitle: string;
      chooseSubtitle: string;
      viewAll: string;
      featuresKicker: string;
      featuresTitle: string;
      watchMore: string;
      testimonialsKicker: string;
      testimonialsTitle: string;
      asSeenIn: string;
      accessoriesTitle: string;
      accessoriesSubtitle: string;
      shopAccessories: string;
      ctaTitle: string;
      ctaSubtitle: string;
      shopRanger: string;
    };
  };

  common: {
    remove: string;
    cancel: string;
    apply: string;
    copy: string;
    copied: string;
    share: string;
    loading: string;
    language: string;
    free: string;
    home: string;
    save: string;
    close: string;
    error: string;
  };
};
