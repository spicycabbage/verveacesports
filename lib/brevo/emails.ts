import type { SiteConfig, SiteId } from "@/lib/site/config";
import { formatOrderNumber } from "@/lib/orders/number";
import { orderVariantLabel } from "@/lib/orders/variant-label";
import { getSiteById } from "@/lib/site/get-site";
import type { OrderItem, SalesChannel, ShippingAddress } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils/format";
import { sendBrevoEmail, type BrevoSendResult } from "@/lib/brevo/send";
import { GST_NUMBER, taxLinesForOrder } from "@/lib/tax/label";
import { resolveTrackingUrl } from "@/lib/shipping/carriers";

const GST_LINE = `GST/HST ${GST_NUMBER}`;
const EMAIL_LINK = "#2563eb";
const EMAIL_SUPPORT = "info@verveacesports.com";

function emailSupport(site: SiteConfig): string {
  switch (site.id) {
    case "bleeq-ca":
      return EMAIL_SUPPORT;
    case "volt-ca":
    case "verveace":
      return site.supportEmail;
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

type OrderEmailFields = {
  id: string;
  order_number?: number | null;
  email: string | null;
  currency: "CAD";
  country?: string | null;
  tax_rate?: number | null;
  subtotal: number;
  tax: number;
  shipping: number;
  discount_code: string | null;
  discount_total: number;
  points_value: number;
  total: number;
  shipping_address: ShippingAddress | null;
};

/** Base URL for storefront links (webhooks have no request host). */
export function siteBaseUrl(siteId: SiteId): string {
  if (siteId === "bleeq-ca") {
    const bleeq =
      process.env.NEXT_PUBLIC_BLEEQ_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
    if (bleeq) return bleeq;
  }
  if (siteId === "volt-ca") {
    const volt =
      process.env.NEXT_PUBLIC_VOLT_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
    if (volt) return volt;
    return "https://voltcaddy.ca";
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (envUrl) return envUrl;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailTheme(site: SiteConfig): {
  header: string;
  accent: string;
  headerText: string;
  logoUrl: string | null;
  logoWidth: number;
  logoHeight: number;
  showName: boolean;
} {
  switch (site.id) {
    case "verveace":
      return {
        header: "#193d63",
        accent: "#f97316",
        headerText: "#fafafa",
        logoUrl: `${siteBaseUrl("verveace")}/icons/verveace-180.png`,
        logoWidth: 40,
        logoHeight: 40,
        showName: true,
      };
    case "bleeq-ca":
      return {
        header: "#0a0a0a",
        accent: "#C8FF00",
        headerText: "#fafafa",
        logoUrl: `${siteBaseUrl("bleeq-ca")}/bleeq-logo-email.png`,
        logoWidth: 160,
        logoHeight: 43,
        showName: false,
      };
    case "volt-ca":
      return {
        header: "#3d2b22",
        accent: "#ff7f2d",
        headerText: "#faf6f1",
        logoUrl: `${siteBaseUrl("volt-ca")}/volt-caddy-logo.png`,
        logoWidth: 220,
        logoHeight: 36,
        showName: false,
      };
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

function layoutHtml(opts: {
  site: SiteConfig;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const theme = emailTheme(opts.site);
  const support = escapeHtml(emailSupport(opts.site));
  const name = escapeHtml(opts.site.name);
  const logo = theme.logoUrl
    ? `<img src="${escapeHtml(theme.logoUrl)}" width="${theme.logoWidth}" height="${theme.logoHeight}" alt="${name}" style="display:block;border:0;width:${theme.logoWidth}px;height:${theme.logoHeight}px" />`
    : "";
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<p style="margin:28px 0 8px">
  <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:500;font-size:14px;line-height:1;font-family:Arial,Helvetica,sans-serif">
    ${escapeHtml(opts.ctaLabel)}
  </a>
</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;width:100%;max-width:100%">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(opts.title)}</title>
<style>
  html,body{margin:0!important;padding:0!important;width:100%!important;max-width:100%!important}
  body{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0;mso-table-rspace:0}
  .email-root{width:100%!important;max-width:100%!important}
</style>
</head>
<body style="margin:0;padding:0;width:100%;max-width:100%;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#18181b">
  <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.title)}</div>
  <table class="email-root" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:100%;background:#fff">
    <tr><td style="background:${theme.header};padding:20px 12px 18px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${logo ? `<td style="vertical-align:middle">${logo}</td>` : ""}
          ${
            theme.showName
              ? `<td style="vertical-align:middle;padding-left:${logo ? "12" : "0"}px;color:${theme.headerText};font-size:16px;font-weight:700;letter-spacing:0.02em">${name}</td>`
              : ""
          }
        </tr>
      </table>
    </td></tr>
    <tr><td style="height:4px;line-height:4px;font-size:0;background:${theme.accent}">&nbsp;</td></tr>
    <tr><td style="padding:24px 12px 8px">
      <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:${theme.header}">${escapeHtml(opts.title)}</h1>
    </td></tr>
    <tr><td style="padding:8px 12px 32px;font-size:16px;line-height:1.55;color:#18181b">
      ${opts.bodyHtml}
      ${cta}
    </td></tr>
    <tr><td style="padding:16px 12px;border-top:1px solid #e4e4e7;font-size:13px;color:#64748b;line-height:1.5">
      Questions? Email <a href="mailto:${support}" style="color:${EMAIL_LINK};font-weight:600">${support}</a>
    </td></tr>
  </table>
</body>
</html>`;
}

function layoutText(opts: {
  site: SiteConfig;
  title: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const lines = [
    opts.site.name,
    opts.title,
    "",
    opts.bodyText.trim(),
  ];
  if (opts.ctaLabel && opts.ctaUrl) {
    lines.push("", `${opts.ctaLabel}: ${opts.ctaUrl}`);
  }
  lines.push("", `Questions? Email ${emailSupport(opts.site)}`);
  return lines.join("\n");
}

export function buildAccountWelcomeEmail(input: {
  site: SiteConfig;
  firstName?: string;
  accountUrl: string;
}): BuiltEmail {
  const greet = input.firstName?.trim()
    ? `Hi ${input.firstName.trim()},`
    : "Hi,";
  const title = `Welcome to ${input.site.name}`;
  const bodyHtml = `
    <p style="margin:0 0 14px">${escapeHtml(greet)}</p>
    <p style="margin:0 0 14px">Thanks for creating your ${escapeHtml(input.site.name)} account. You can track orders, earn loyalty points, and manage your profile anytime.</p>
    <p style="margin:0">We're glad you're here — shop ${escapeHtml(input.site.tagline.toLowerCase())} with confidence.</p>
  `;
  const bodyText = `${greet}

Thanks for creating your ${input.site.name} account. You can track orders, earn loyalty points, and manage your profile anytime.

We're glad you're here — shop ${input.site.tagline.toLowerCase()} with confidence.`;

  return {
    subject: `Welcome to ${input.site.name}`,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
      ctaLabel: "View your account",
      ctaUrl: input.accountUrl,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
      ctaLabel: "View your account",
      ctaUrl: input.accountUrl,
    }),
  };
}

export function buildNewsletterWelcomeEmail(input: {
  site: SiteConfig;
  shopUrl: string;
}): BuiltEmail {
  const title = "You're on the list";
  const bodyHtml = `
    <p style="margin:0 0 14px">Thanks for subscribing to ${escapeHtml(input.site.name)} updates.</p>
    <p style="margin:0 0 14px">We'll share new drops, restocks, and offers — no spam, just the good stuff.</p>
    <p style="margin:0">In the meantime, explore the latest gear.</p>
  `;
  const bodyText = `Thanks for subscribing to ${input.site.name} updates.

We'll share new drops, restocks, and offers — no spam, just the good stuff.

In the meantime, explore the latest gear.`;

  return {
    subject: `Welcome to ${input.site.name} updates`,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
      ctaLabel: "Shop now",
      ctaUrl: input.shopUrl,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
      ctaLabel: "Shop now",
      ctaUrl: input.shopUrl,
    }),
  };
}

function formatAddress(addr: ShippingAddress | null): { html: string; text: string } {
  if (!addr) return { html: "<p style=\"margin:0;color:#71717a\">No shipping address on file.</p>", text: "No shipping address on file." };
  const lines = [
    addr.full_name,
    addr.line1,
    addr.line2,
    `${addr.city}, ${addr.state} ${addr.postal_code}`,
    addr.country,
    addr.phone,
  ].filter((l): l is string => Boolean(l?.trim()));
  return {
    html: `<p style="margin:0;white-space:pre-line">${escapeHtml(lines.join("\n"))}</p>`,
    text: lines.join("\n"),
  };
}

type EmailLineItem = Pick<OrderItem, "product_name" | "qty" | "unit_price" | "currency"> & {
  sku?: string | null;
  variant_title?: string | null;
};

function orderItemRows(items: EmailLineItem[], currency: "CAD"): { html: string; text: string } {
  const html = items
    .map((item) => {
      const lineTotal = Number(item.unit_price) * Number(item.qty);
      const variant = orderVariantLabel(item.variant_title);
      const variantHtml = variant
        ? `<div style="font-size:13px;color:#52525b">${escapeHtml(variant)}</div>`
        : "";
      const sku = item.sku?.trim()
        ? `<div style="font-size:13px;color:#71717a">${escapeHtml(item.sku)}</div>`
        : "";
      return `<tr>
  <td style="padding:8px 0;border-bottom:1px solid #e4e4e7">${escapeHtml(item.product_name)} × ${item.qty}${variantHtml}${sku}</td>
  <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right">${escapeHtml(formatPrice(lineTotal, currency))}</td>
</tr>`;
    })
    .join("");
  const text = items
    .map((item) => {
      const lineTotal = Number(item.unit_price) * Number(item.qty);
      const variant = orderVariantLabel(item.variant_title);
      return `- ${item.product_name}${variant ? ` (${variant})` : ""} × ${item.qty}: ${formatPrice(lineTotal, currency)}`;
    })
    .join("\n");
  return { html, text };
}

function orderTotals(order: OrderEmailFields): { html: string; text: string } {
  const currency = order.currency;
  const shippingValue =
    Number(order.shipping) === 0 ? "FREE" : formatPrice(Number(order.shipping), currency);
  const totals: { label: string; value: string }[] = [
    { label: "Subtotal", value: formatPrice(Number(order.subtotal), currency) },
    { label: "Shipping", value: shippingValue },
    ...taxLinesForOrder({
      country: order.country,
      tax: Number(order.tax),
      tax_rate: Number(order.tax_rate ?? 0),
      subtotal: Number(order.subtotal),
      discount_total: order.discount_total,
      points_value: order.points_value,
      shipping: order.shipping,
      shipping_address: order.shipping_address,
    }).map((line) => ({
      label: line.label,
      value: formatPrice(line.amount, currency),
    })),
  ];
  if (Number(order.discount_total) > 0) {
    const code = order.discount_code ? ` (${order.discount_code})` : "";
    totals.push({
      label: `Discount${code}`,
      value: `−${formatPrice(Number(order.discount_total), currency)}`,
    });
  }
  if (Number(order.points_value) > 0) {
    totals.push({
      label: "Loyalty credit",
      value: `−${formatPrice(Number(order.points_value), currency)}`,
    });
  }
  totals.push({ label: "Total", value: formatPrice(Number(order.total), currency) });

  const html = totals
    .map(
      (t, i) =>
        `<tr>
  <td style="padding:4px 0;${i === totals.length - 1 ? "font-weight:700;padding-top:10px" : ""}">${escapeHtml(t.label)}</td>
  <td style="padding:4px 0;text-align:right;${i === totals.length - 1 ? "font-weight:700;padding-top:10px" : ""}">${escapeHtml(t.value)}</td>
</tr>`,
    )
    .join("");
  const text = totals.map((t) => `${t.label}: ${t.value}`).join("\n");
  return { html, text };
}

export function buildOrderConfirmationEmail(input: {
  site: SiteConfig;
  order: OrderEmailFields;
  items: EmailLineItem[];
  orderUrl: string;
}): BuiltEmail {
  const currency = input.order.currency;
  const label = formatOrderNumber(input.order);
  const title = `Order confirmed`;
  const subject = `Order confirmed · ${label}`;
  const items = orderItemRows(input.items, currency);
  const totals = orderTotals(input.order);
  const address = formatAddress(input.order.shipping_address);

  const bodyHtml = `
    <p style="margin:0 0 14px">Thanks for your order with ${escapeHtml(input.site.name)}. We've received your payment and will start preparing it shortly.</p>
    <p style="margin:0 0 18px"><strong>Order ${escapeHtml(label)}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;font-size:15px">
      ${items.html || "<tr><td colspan=\"2\" style=\"padding:8px 0;color:#71717a\">No line items</td></tr>"}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;font-size:15px">
      ${totals.html}
    </table>
    <p style="margin:0 0 6px;font-weight:700">Ship to</p>
    ${address.html}
    <p style="margin:18px 0 0;font-size:13px;color:#71717a">${escapeHtml(GST_LINE)}</p>
  `;

  const bodyText = `Thanks for your order with ${input.site.name}. We've received your payment and will start preparing it shortly.

Order ${label}

${items.text || "No line items"}

${totals.text}

Ship to:
${address.text}

${GST_LINE}`;

  return {
    subject,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
      ctaLabel: "View order",
      ctaUrl: input.orderUrl,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
      ctaLabel: "View order",
      ctaUrl: input.orderUrl,
    }),
  };
}

export function buildPosInvoiceEmail(input: {
  site: SiteConfig;
  order: OrderEmailFields;
  items: EmailLineItem[];
}): BuiltEmail {
  const currency = input.order.currency;
  const label = formatOrderNumber(input.order);
  const title = "Invoice";
  const subject = `Invoice · ${label}`;
  const items = orderItemRows(input.items, currency);
  const totals = orderTotals(input.order);
  const billName = input.order.shipping_address?.full_name?.trim() || "";
  const billEmail = input.order.email?.trim() || "";
  const billLines = [billName, billEmail].filter(Boolean);
  const billHtml = billLines.length
    ? `<p style="margin:0;white-space:pre-line">${escapeHtml(billLines.join("\n"))}</p>`
    : `<p style="margin:0;color:#71717a">In-store customer</p>`;
  const billText = billLines.join("\n") || "In-store customer";

  const bodyHtml = `
    <p style="margin:0 0 14px">Thanks for shopping at ${escapeHtml(input.site.name)}. Here's your invoice for this in-store purchase.</p>
    <p style="margin:0 0 18px"><strong>Invoice ${escapeHtml(label)}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;font-size:15px">
      ${items.html || "<tr><td colspan=\"2\" style=\"padding:8px 0;color:#71717a\">No line items</td></tr>"}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;font-size:15px">
      ${totals.html}
    </table>
    <p style="margin:0 0 6px;font-weight:700">Bill to</p>
    ${billHtml}
    <p style="margin:18px 0 6px;font-weight:700">Fulfillment</p>
    <p style="margin:0">In-store pickup · paid in person</p>
    <p style="margin:18px 0 0;font-size:13px;color:#71717a">${escapeHtml(GST_LINE)}</p>
  `;

  const bodyText = `Thanks for shopping at ${input.site.name}. Here's your invoice for this in-store purchase.

Invoice ${label}

${items.text || "No line items"}

${totals.text}

Bill to:
${billText}

Fulfillment:
In-store pickup · paid in person

${GST_LINE}`;

  return {
    subject,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
    }),
  };
}

/**
 * From must be on an authenticated Brevo domain.
 * `verveacesports.com` is authenticated — default From is info@.
 * `bleequp.ca` is not; Bleeq still uses this address unless BREVO_SENDER_EMAIL is set.
 */
function senderFor(site: SiteConfig) {
  const email =
    process.env.BREVO_SENDER_EMAIL?.trim() || "info@verveacesports.com";
  return { name: site.name, email };
}

function replyToFor(site: SiteConfig) {
  return { name: site.name, email: emailSupport(site) };
}

export async function sendAccountWelcomeEmail(input: {
  siteId: SiteId;
  toEmail: string;
  firstName?: string;
}): Promise<BrevoSendResult> {
  const site = getSiteById(input.siteId);
  const base = siteBaseUrl(input.siteId);
  const built = buildAccountWelcomeEmail({
    site,
    firstName: input.firstName,
    accountUrl: `${base}/account`,
  });
  return sendBrevoEmail({
    to: { email: input.toEmail, name: input.firstName },
    subject: built.subject,
    html: built.html,
    text: built.text,
    sender: senderFor(site),
    replyTo: replyToFor(site),
  });
}

export function buildPasswordResetEmail(input: {
  site: SiteConfig;
  firstName?: string;
  resetUrl: string;
}): BuiltEmail {
  const greet = input.firstName?.trim() ? `Hi ${input.firstName.trim()},` : "Hi,";
  const title = "Reset your password";
  const bodyHtml = `
    <p style="margin:0 0 14px">${escapeHtml(greet)}</p>
    <p style="margin:0 0 14px">We received a request to reset the password for your ${escapeHtml(input.site.name)} account. Choose a new one with the button below. This link expires in 1 hour and works only once.</p>
    <p style="margin:0">If you didn't ask for this, ignore this email. Your password won't change.</p>
  `;
  const bodyText = `${greet}

We received a request to reset the password for your ${input.site.name} account. Choose a new one with the link below. This link expires in 1 hour and works only once.

If you didn't ask for this, ignore this email. Your password won't change.`;

  return {
    subject: `Reset your ${input.site.name} password`,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
      ctaLabel: "Reset password",
      ctaUrl: input.resetUrl,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
      ctaLabel: "Reset password",
      ctaUrl: input.resetUrl,
    }),
  };
}

export async function sendNewsletterWelcomeEmail(input: {
  siteId: SiteId;
  toEmail: string;
}): Promise<BrevoSendResult> {
  const site = getSiteById(input.siteId);
  const base = siteBaseUrl(input.siteId);
  const built = buildNewsletterWelcomeEmail({
    site,
    shopUrl: `${base}/products`,
  });
  return sendBrevoEmail({
    to: { email: input.toEmail },
    subject: built.subject,
    html: built.html,
    text: built.text,
    sender: senderFor(site),
    replyTo: replyToFor(site),
  });
}

export async function sendPasswordResetEmail(input: {
  siteId: SiteId;
  toEmail: string;
  firstName?: string;
  resetUrl: string;
}): Promise<BrevoSendResult> {
  const site = getSiteById(input.siteId);
  const built = buildPasswordResetEmail({
    site,
    firstName: input.firstName,
    resetUrl: input.resetUrl,
  });
  return sendBrevoEmail({
    to: { email: input.toEmail, name: input.firstName },
    subject: built.subject,
    html: built.html,
    text: built.text,
    sender: senderFor(site),
    replyTo: replyToFor(site),
  });
}

export async function sendOrderConfirmationEmail(input: {
  siteId: SiteId;
  order: OrderEmailFields;
  items: EmailLineItem[];
  salesChannel?: SalesChannel;
}): Promise<BrevoSendResult> {
  const email = input.order.email?.trim();
  if (!email) {
    return { ok: false, error: "Order has no email" };
  }
  const site = getSiteById(input.siteId);
  const base = siteBaseUrl(input.siteId);
  const built =
    input.salesChannel === "pos"
      ? buildPosInvoiceEmail({
          site,
          order: input.order,
          items: input.items,
        })
      : buildOrderConfirmationEmail({
          site,
          order: input.order,
          items: input.items,
          orderUrl: `${base}/account/orders/${input.order.id}`,
        });
  const shipName = input.order.shipping_address?.full_name;
  return sendBrevoEmail({
    to: { email, name: shipName },
    subject: built.subject,
    html: built.html,
    text: built.text,
    sender: senderFor(site),
    replyTo: replyToFor(site),
  });
}

export function buildAdminNewOrderEmail(input: {
  site: SiteConfig;
  order: OrderEmailFields;
  items: EmailLineItem[];
  salesChannel?: SalesChannel;
  adminUrl: string;
}): BuiltEmail {
  const currency = input.order.currency;
  const label = formatOrderNumber(input.order);
  const channel = input.salesChannel === "pos" ? "POS" : "Online";
  const title = `New ${channel.toLowerCase()} order`;
  const subject = `New ${channel} order · ${label} · ${formatPrice(Number(input.order.total), currency)}`;
  const items = orderItemRows(input.items, currency);
  const totals = orderTotals(input.order);
  const address = formatAddress(input.order.shipping_address);
  const customer = input.order.email?.trim() || "No customer email";

  const bodyHtml = `
    <p style="margin:0 0 14px">A paid order is waiting to be fulfilled.</p>
    <p style="margin:0 0 18px"><strong>Order ${escapeHtml(label)}</strong> · ${escapeHtml(channel)} · ${escapeHtml(customer)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;font-size:15px">
      ${items.html || "<tr><td colspan=\"2\" style=\"padding:8px 0;color:#71717a\">No line items</td></tr>"}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;font-size:15px">
      ${totals.html}
    </table>
    <p style="margin:0 0 6px;font-weight:700">Ship to</p>
    ${address.html}
  `;

  const bodyText = `A paid order is waiting to be fulfilled.

Order ${label} · ${channel} · ${customer}

${items.text || "No line items"}

${totals.text}

Ship to:
${address.text}`;

  return {
    subject,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
      ctaLabel: "Open in admin",
      ctaUrl: input.adminUrl,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
      ctaLabel: "Open in admin",
      ctaUrl: input.adminUrl,
    }),
  };
}

export type ShipmentEmailRow = {
  company?: string | null;
  number: string;
  url?: string | null;
};

export function buildOrderShippedEmail(input: {
  site: SiteConfig;
  order: OrderEmailFields;
  shipments: ShipmentEmailRow[];
  orderUrl: string;
}): BuiltEmail {
  const label = formatOrderNumber(input.order);
  const title = "Your order is packed";
  const subject = `Your order ${label} has been packed`;
  const address = formatAddress(input.order.shipping_address);
  const tracks = input.shipments.filter((s) => s.number.trim());
  const trackHtml = tracks.length
    ? tracks
        .map((s) => {
          const href = resolveTrackingUrl({
            company: s.company,
            trackingNumber: s.number,
            trackingUrl: s.url,
          });
          const who = s.company?.trim() || "Carrier";
          const link = href
            ? `<a href="${escapeHtml(href)}" style="color:${EMAIL_LINK};font-weight:700">${escapeHtml(s.number)}</a>`
            : escapeHtml(s.number);
          return `<p style="margin:0 0 8px"><strong>${escapeHtml(who)}</strong> · ${link}</p>`;
        })
        .join("")
    : `<p style="margin:0 0 8px;color:#71717a">Tracking will appear here once the carrier scans the package.</p>`;
  const trackText = tracks.length
    ? tracks
        .map((s) => {
          const href = resolveTrackingUrl({
            company: s.company,
            trackingNumber: s.number,
            trackingUrl: s.url,
          });
          return `${s.company?.trim() || "Carrier"}: ${s.number}${href ? `\n${href}` : ""}`;
        })
        .join("\n\n")
    : "Tracking will appear here once the carrier scans the package.";

  const bodyHtml = `
    <p style="margin:0 0 14px">Good news — your order ${escapeHtml(label)} has been packed and is on its way.</p>
    <p style="margin:0 0 6px;font-weight:700">Tracking</p>
    ${trackHtml}
    <p style="margin:18px 0 6px;font-weight:700">Ship to</p>
    ${address.html}
  `;
  const bodyText = `Good news — your order ${label} has been packed and is on its way.

Tracking
${trackText}

Ship to:
${address.text}`;

  return {
    subject,
    html: layoutHtml({
      site: input.site,
      title,
      bodyHtml,
      ctaLabel: "View order",
      ctaUrl: input.orderUrl,
    }),
    text: layoutText({
      site: input.site,
      title,
      bodyText,
      ctaLabel: "View order",
      ctaUrl: input.orderUrl,
    }),
  };
}

export async function sendOrderShippedEmail(input: {
  siteId: SiteId;
  order: OrderEmailFields;
  shipments: ShipmentEmailRow[];
  to?: string;
  subject?: string;
}): Promise<BrevoSendResult> {
  const email = input.to?.trim() || input.order.email?.trim();
  if (!email) return { ok: false, error: "Order has no email" };
  const site = getSiteById(input.siteId);
  const base = siteBaseUrl(input.siteId);
  const built = buildOrderShippedEmail({
    site,
    order: input.order,
    shipments: input.shipments,
    orderUrl: `${base}/account/orders/${input.order.id}`,
  });
  return sendBrevoEmail({
    to: { email, name: input.order.shipping_address?.full_name },
    subject: input.subject ?? built.subject,
    html: built.html,
    text: built.text,
    sender: senderFor(site),
    replyTo: replyToFor(site),
  });
}

export async function sendAdminNewOrderEmail(input: {
  siteId: SiteId;
  to: { email: string; name?: string }[];
  order: OrderEmailFields;
  items: EmailLineItem[];
  salesChannel?: SalesChannel;
}): Promise<BrevoSendResult> {
  const site = getSiteById(input.siteId);
  const base = siteBaseUrl("verveace");
  const built = buildAdminNewOrderEmail({
    site,
    order: input.order,
    items: input.items,
    salesChannel: input.salesChannel,
    adminUrl: `${base}/admin/orders/${input.order.id}`,
  });
  const recipients = input.to
    .map((r) => ({
      email: r.email.trim().toLowerCase(),
      name: r.name?.trim(),
    }))
    .filter((r) => r.email);
  if (recipients.length === 0) {
    return { ok: false, error: "No admin recipients" };
  }

  const results = await Promise.all(
    recipients.map((to) =>
      sendBrevoEmail({
        to,
        subject: built.subject,
        html: built.html,
        text: built.text,
        sender: senderFor(site),
        replyTo: replyToFor(site),
      }),
    ),
  );
  const failed = results.find((r) => !r.ok);
  return failed ?? results[0]!;
}
