export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type LoyaltyTxType =
  | "earn_purchase"
  | "earn_referral"
  | "redeem"
  | "adjust";

export type ReferralStatus = "pending" | "qualified";

export type FinancialStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "voided";

export type OrderFulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "restocked";

export type PaymentKind = "authorization" | "capture" | "sale" | "refund" | "void";
export type PaymentStatus = "pending" | "succeeded" | "failed";
export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";

export type InventoryReason =
  | "initial"
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "reservation"
  | "release"
  | "recount"
  | "transfer";

export type Profile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  country: "US" | "CA";
  referral_code: string;
  referred_by: string | null;
  loyalty_points: number;
  is_admin: boolean;
  site_id: "verveace" | "bleeq-ca" | "volt-ca";
  created_at: string;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  /** bleequp | mgi | motocaddy | volt-caddy. Absent until 0046 is applied. */
  brand?: string | null;
  price_usd: number;
  price_cad: number;
  images: string[];
  stock: number;
  is_active: boolean;
  options: ProductOption[];
  has_variants: boolean;
  created_at: string;
  /** `{ fr: { name, description }, ... }` — absent until 0041 is applied. */
  translations?: Record<string, { name?: string; description?: string }> | null;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  author_display_name: string;
  is_verified_purchase: boolean;
  is_published: boolean;
  source: "storefront" | "legacy" | "import";
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  barcode: string | null;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price_usd: number;
  price_cad: number;
  compare_at_usd: number | null;
  compare_at_cad: number | null;
  cost_usd: number | null;
  cost_cad: number | null;
  weight_grams: number;
  requires_shipping: boolean;
  taxable: boolean;
  position: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
};

export type Location = {
  id: string;
  name: string;
  address: Record<string, unknown> | null;
  is_active: boolean;
  is_default: boolean;
  priority: number;
  stripe_location_id: string | null;
  stripe_location_id_cad: string | null;
  tax_country: string | null;
  tax_region: string | null;
  created_at: string;
};

export type InventoryLevel = {
  variant_id: string;
  location_id: string;
  on_hand: number;
  reserved: number;
  reorder_point: number;
  available: number;
  updated_at: string;
};

export type InventoryLedgerEntry = {
  id: string;
  variant_id: string;
  location_id: string;
  delta: number;
  reason: InventoryReason;
  on_hand_after: number | null;
  reserved_after: number | null;
  order_id: string | null;
  note: string | null;
  actor: string | null;
  created_at: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
  position: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  location_id: string | null;
  sku: string | null;
  qty: number;
  fulfilled_qty: number;
  refunded_qty: number;
  unit_price: number;
  cost_usd: number | null;
  cost_cad: number | null;
  currency: string;
  product_name: string;
  product_image: string | null;
  /** Variant picked at checkout, e.g. "Black Frame - Silver ZEISS Lens / No extra lens". */
  variant_title?: string | null;
};

export type SalesChannel = "online" | "pos";

export type Order = {
  id: string;
  order_number: number;
  user_id: string | null;
  site_id: "verveace" | "bleeq-ca" | "volt-ca";
  status: OrderStatus;
  financial_status: FinancialStatus;
  fulfillment_status: OrderFulfillmentStatus;
  sales_channel: SalesChannel;
  currency: "USD" | "CAD";
  email: string | null;
  subtotal: number;
  tax: number;
  tax_rate: number;
  shipping: number;
  discount_code: string | null;
  discount_total: number;
  points_redeemed: number;
  points_value: number;
  total: number;
  refunded_total: number;
  country: "US" | "CA";
  stripe_pi_id: string | null;
  shipping_address: ShippingAddress | null;
  customer_note: string | null;
  admin_note: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  order_id: string;
  kind: PaymentKind;
  status: PaymentStatus;
  amount: number;
  currency: "USD" | "CAD";
  gateway: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_refund_id: string | null;
  error_message: string | null;
  created_at: string;
};

export type Refund = {
  id: string;
  order_id: string;
  amount: number;
  currency: "USD" | "CAD";
  reason: string | null;
  restock: boolean;
  stripe_refund_id: string | null;
  actor: string | null;
  created_at: string;
};

export type Fulfillment = {
  id: string;
  order_id: string;
  location_id: string | null;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  tracking_company: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  actor: string | null;
  created_at: string;
};

export type Discount = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  applies_to: "order" | "shipping";
  min_subtotal: number;
  usage_limit: number | null;
  used_count: number;
  per_customer_limit: number | null;
  once_per_customer: boolean;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type ShippingRateWithZone = {
  id: string;
  zone_id: string;
  name: string;
  price_usd: number;
  price_cad: number;
  min_subtotal: number;
  free_over: number | null;
  is_active: boolean;
  position: number;
  shipping_zones: { name: string; countries: string[] };
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type ShippingAddress = {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: "US" | "CA";
  /** Required on storefront checkout; optional on POS pickup / legacy orders. */
  phone?: string;
};

export type LoyaltyTransaction = {
  id: string;
  user_id: string;
  order_id: string | null;
  type: LoyaltyTxType;
  points: number;
  note: string | null;
  created_at: string;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referee_id: string;
  status: ReferralStatus;
  qualified_at: string | null;
  created_at: string;
};

export type RefundLineItem = {
  id: string;
  refund_id: string;
  order_item_id: string;
  qty: number;
  amount: number;
};

export type StripeBalanceTransaction = {
  id: string;
  stripe_charge_id: string | null;
  stripe_refund_id: string | null;
  stripe_payout_id: string | null;
  order_id: string | null;
  type: string;
  currency: "USD" | "CAD";
  gross: number;
  fee: number;
  net: number;
  available_on: string | null;
  created_at: string;
};

export type StripePayout = {
  id: string;
  currency: "USD" | "CAD";
  amount: number;
  status: string;
  arrival_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatQuestion = {
  id: string;
  site_id: "verveace" | "bleeq-ca" | "volt-ca";
  question: string;
  locale: string | null;
  country: "US" | "CA" | null;
  currency: "USD" | "CAD" | null;
  user_id: string | null;
  message_count: number | null;
  created_at: string;
};

export type LiveChatStatus = "requested" | "active" | "closed";

export type LiveChatRow = {
  id: string;
  site_id: "verveace" | "bleeq-ca" | "volt-ca";
  status: LiveChatStatus;
  customer_user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  accepted_by: string | null;
  accepted_by_email: string | null;
  accepted_by_name: string | null;
  accepted_at: string | null;
  closed_by: string | null;
  closed_at: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

export type LiveChatMessageRow = {
  id: string;
  chat_id: string;
  sender_role: "customer" | "admin" | "system";
  sender_user_id: string | null;
  sender_email: string | null;
  body: string;
  created_at: string;
};

export type WarrantyRegistration = {
  id: string;
  site_id: "verveace" | "bleeq-ca" | string;
  full_name: string;
  email: string;
  order_number: string;
  product_slug: string;
  product_label: string;
  serial_number: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
};
