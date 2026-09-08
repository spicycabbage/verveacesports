import type { SiteConfig, SiteId } from "@/lib/site/config";
import { getSiteById } from "@/lib/site/get-site";
import type { OrderItem, SalesChannel, ShippingAddress } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils/format";
import { sendBrevoEmail, type BrevoSendResult } from "@/lib/brevo/send";
import { GST_NUMBER, taxLinesForOrder } from "@/lib/tax/label";

const GST_LINE = `GST/HST ${GST_NUMBER}`;

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

type OrderEmailFields = {
  id: string;
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

function layoutHtml(opts: {
  site: SiteConfig;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const support = escapeHtml(opts.site.supportEmail);
  const name = escapeHtml(opts.site.name);
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<p style="margin:28px 0 8px">
  <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">
    ${escapeHtml(opts.ctaLabel)}
  </a>
</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;color:#18181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:8px;overflow:hidden">
        <tr><td style="padding:28px 28px 8px;border-bottom:1px solid #e4e4e7">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a">${name}</p>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;font-weight:700">${escapeHtml(opts.title)}</h1>
        </td></tr>
        <tr><td style="padding:24px 28px 32px;font-size:16px;line-height:1.55">
          ${opts.bodyHtml}
          ${cta}
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #e4e4e7;font-size:13px;color:#71717a;line-height:1.5">
          Questions? Email <a href="mailto:${support}" style="color:#18181b">${support}</a>
        </td></tr>
      </table>
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
  lines.push("", `Questions? Email ${opts.site.supportEmail}`);
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
  ].filter((l): l is string => Boolean(l?.trim()));
  return {
    html: `<p style="margin:0;white-space:pre-line">${escapeHtml(lines.join("\n"))}</p>`,
    text: lines.join("\n"),
  };
}

type EmailLineItem = Pick<OrderItem, "product_name" | "qty" | "unit_price" | "currency"> & {
  sku?: string | null;
};

function orderItemRows(items: EmailLineItem[], currency: "CAD"): { html: string; text: string } {
  const html = items
    .map((item) => {
      const lineTotal = Number(item.unit_price) * Number(item.qty);
      const sku = item.sku?.trim()
        ? `<div style="font-size:13px;color:#71717a">${escapeHtml(item.sku)}</div>`
        : "";
      return `<tr>
  <td style="padding:8px 0;border-bottom:1px solid #e4e4e7">${escapeHtml(item.product_name)} × ${item.qty}${sku}</td>
  <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right">${escapeHtml(formatPrice(lineTotal, currency))}</td>
</tr>`;
    })
    .join("");
  const text = items
    .map((item) => {
      const lineTotal = Number(item.unit_price) * Number(item.qty);
      return `- ${item.product_name} × ${item.qty}: ${formatPrice(lineTotal, currency)}`;
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
  const shortId = input.order.id.slice(0, 8).toUpperCase();
  const title = `Order confirmed`;
  const subject = `Order confirmed · #${shortId}`;
  const items = orderItemRows(input.items, currency);
  const totals = orderTotals(input.order);
  const address = formatAddress(input.order.shipping_address);

  const bodyHtml = `
    <p style="margin:0 0 14px">Thanks for your order with ${escapeHtml(input.site.name)}. We've received your payment and will start preparing it shortly.</p>
    <p style="margin:0 0 18px"><strong>Order #${escapeHtml(shortId)}</strong></p>
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

Order #${shortId}

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
  const shortId = input.order.id.slice(0, 8).toUpperCase();
  const title = "Invoice";
  const subject = `Invoice · #${shortId}`;
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
    <p style="margin:0 0 18px"><strong>Invoice #${escapeHtml(shortId)}</strong></p>
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

Invoice #${shortId}

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

function senderFor(site: SiteConfig) {
  return { name: site.name, email: site.supportEmail };
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
  });
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
  });
}
