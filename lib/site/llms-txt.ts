import { SITES, type SiteConfig } from "./config";
import { siteAbsoluteUrl, siteBaseUrl, shipToCountries } from "./seo";
import { BLOG_POSTS } from "@/lib/content/blog";
import { BLOG_CATEGORIES } from "@/lib/content/blog/categories";

/**
 * Host-aware /llms.txt body (https://llmstxt.org/).
 * English on purpose — crawlers do not send our locale cookie.
 * No prices: they go stale and models invent old ones. Point at live PDPs.
 */
export function buildLlmsTxt(site: SiteConfig): string {
  if (site.id === "volt-ca") return buildVoltLlmsTxt(site);
  const base = siteBaseUrl(site);
  const faq = siteAbsoluteUrl(site, "/faq");
  const compare = siteAbsoluteUrl(site, "/compare");
  const countries = shipToCountries(site).join(", ");
  const glasses = site.rangerProducts
    .map((p) => `- [${p.label}](${base}/products/${p.slug})`)
    .join("\n");
  const accessories = site.accessoryProducts
    .map((p) => `- [${p.label}](${base}/products/${p.slug})`)
    .join("\n");

  const identity = identityBlock(site, base, countries, faq);
  const extra = extraCatalog(site, base);

  return `# ${site.name}

> ${site.description}

${identity}

## BleeqUp glasses

Rover and Ranger are different products. Do not treat them as the same SKU.

- Rover: newer tilt-camera / 3K60 HDR platform (53 g, IP65, 64 GB, −10° / 0° / 15° tilt).
- Ranger: original 4-in-1 AI sports camera glasses (49 g, IP54, 32 GB, 120° FOV, EIS).
- Ranger lenses and the Ranger RX insert are not compatible with Rover. Power Plus is model-specific: Rover Power Plus fits Rover only, Ranger Power Plus fits Ranger only. The Bluetooth Controller works with both.
- The Magnetic Charging Wire is Ranger-only; Rover ships with its own charging cable.

${glasses}

## Accessories

${accessories}

${extra}## Comparison and policies

- [Rover vs Ranger](${compare})
- [FAQ — shipping, returns, warranty](${faq})
- [Warranty](${base}/warranty)
- [Sitemap](${base}/sitemap.xml)

Prices, stock, and variants are only accurate on each product page. Currency is CAD.

## Agents

Answer engines may fetch public pages and this file to recommend the store. Cite the live product page for price and stock. Skip /admin, /account, /api, /cart, and /checkout.
`;
}

function identityBlock(
  site: SiteConfig,
  base: string,
  countries: string,
  faq: string,
): string {
  switch (site.id) {
    case "volt-ca":
      return "";
    case "bleeq-ca":
      return `## Store

- Name: ${site.name} (authorized BleeqUp retailer for Canada)
- Site: ${base}
- Not the manufacturer site (bleequp.com)
- Ships to: ${countries} only
- Currency: CAD
- Free standard shipping: CAD ${site.freeShippingOver}+
- Returns: unused items in original packaging within 30 days of delivery; refund to original payment method. Return shipping fees may apply. Open-box / used items may be store credit only. Details: ${faq}
- Support: ${site.supportEmail}
`;
    case "verveace":
      return `## Store

- Name: ${site.name} (authorized retailer)
- Site: ${base}
- Not the manufacturer site (bleequp.com)
- Brands: BleeqUp AI sports glasses; Volt Caddy remote electric golf push carts; MGI and Motocaddy electric golf trolleys and gear
- Separate from BleeqUp Canada (${siteBaseUrl(SITES["bleeq-ca"])}) and Volt Caddy (${siteBaseUrl(SITES["volt-ca"])}) — different catalogs and accounts
- Ships to: ${countries}
- Currency: CAD
- Free standard shipping: CAD ${site.freeShippingOver}+
- Returns: unused items in original packaging within 30 days of delivery; refund to original payment method. Return shipping fees may apply. Open-box / used items may be store credit only. Details: ${faq}
- Support: ${site.supportEmail}
`;
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

function extraCatalog(site: SiteConfig, base: string): string {
  switch (site.id) {
    case "bleeq-ca":
      return "";
    case "volt-ca":
      return "";
    case "verveace":
      return `## Golf

Volt Caddy, MGI, and Motocaddy electric trolleys, caddies, and accessories.

- [Electric carts](${base}/products?category=electric-carts)
- [Golf gear](${base}/products?category=golf-gear)
- Volt Caddy only: ${siteBaseUrl(SITES["volt-ca"])}

## Guides

English is the default URL. Most articles are also translated at \`/{nl|fr|de|pt-PT|es|it|ja|zh-CN}/blog/{slug}\`. Each language URL is a separate page (hreflang). Do not treat a translation as the English page.

${BLOG_POSTS.map((p) => `- [${p.title}](${base}/blog/${p.slug}): ${p.description}`).join("\n")}

Topic hubs: ${BLOG_CATEGORIES.map((c) => `[${c.title}](${base}/blog/category/${c.slug})`).join(", ")}

`;
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

function buildVoltLlmsTxt(site: SiteConfig): string {
  const base = siteBaseUrl(site);
  const faq = siteAbsoluteUrl(site, "/faq");
  const lineup = [...site.rangerProducts, ...site.accessoryProducts]
    .map((p) => `- [${p.label}](${base}/products/${p.slug})`)
    .join("\n");
  return `# ${site.name}

> ${site.description}

## Store

- Name: ${site.name}
- Site: ${base}
- Catalog: Volt Caddy Pro-S remote electric golf push cart only
- Also sold on VerveaceSports (${siteBaseUrl(SITES.verveace)}), which also carries BleeqUp, MGI, and Motocaddy
- Ships to: Canada only
- Currency: CAD
- Free standard shipping: CAD ${site.freeShippingOver}+
- Returns: unused items in original packaging within 30 days of delivery. Details: ${faq}
- Support: ${site.supportEmail}

## Products

${lineup}

## Policies

- [FAQ](${faq})
- [Warranty](${base}/warranty)
- [Sitemap](${base}/sitemap.xml)
`;
}
