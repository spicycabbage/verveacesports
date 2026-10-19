import type { Locale } from "@/lib/i18n/locale";
import type { SiteId } from "@/lib/site/config";
import { SITES } from "@/lib/site/config";
import { faqSectionsForSite } from "@/lib/content/faq";
import {
  BLEEQUUP_HERO,
  BLEEQUUP_PROMOS,
  BLEEQUUP_FEATURE_VIDEOS,
  BLEEQUUP_SETUP_VIDEO,
} from "@/lib/content/bleequp-ai-glasses";
import { listStorefrontProducts } from "@/lib/catalog/queries";
import { descriptionPlainText } from "@/lib/catalog/description";
import {
  catalogProductDescription,
  catalogProductName,
} from "@/lib/i18n/catalog-copy";
import { formatPrice } from "@/lib/utils/format";

/** Flatten FAQ content for the assistant system prompt (site-specific). */
export function buildFaqKnowledge(siteId: SiteId): string {
  return faqSectionsForSite(siteId)
    .map((section) => {
      const items = section.items
        .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
        .join("\n\n");
      return `## ${section.title}\n\n${items}`;
    })
    .join("\n\n");
}

function productList(siteId: SiteId): string {
  const site = SITES[siteId];
  const glasses = site.rangerProducts
    .map((p) => `- ${p.label} (slug: /products/${p.slug})`)
    .join("\n");
  const accessories = site.accessoryProducts
    .map((p) => `- ${p.label} (slug: /products/${p.slug})`)
    .join("\n");
  return `### Glasses lineup (Rover + Ranger)\n${glasses}\n\n### Accessories & services\n${accessories}`;
}

function buildRoverProductKnowledge(): string {
  return `## BleeqUp Rover product facts

BleeqUp Rover AI Sports Glasses — next-gen platform alongside Ranger.

Key specs (do not invent others):
- 3-level tilt camera: -10° / 0° / 15°
- 3K60 HDR video, 64GB storage
- Open-ear audio + AI assistance for riding
- IP65, 53g
- Includes magnetic charging cable, prescription frame insert, and storage kit
- ZEISS UV400 lenses on the Rover ZEISS model

Lineup:
- Rover — ZEISS (/products/bleequp-rover-ai-sports-glasses)
- Rover — Bundle: glasses + Rover Power Plus + Bluetooth controller; optional photochromic clear lens (/products/bleequp-rover-ai-sports-glasses-bundle)
- Rover Power Plus: extends recording up to 5 hours, or audio playback up to 48 hours (/products/bleequp-rover-power-plus)
- Replacement lenses: ZEISS, photochromic, polarized

Rover vs Ranger: Rover is the newer tilt-camera / HDR platform. Ranger is the original 4-in-1 AI sports camera glasses (120° FOV, EIS, AI editing). Do not treat them as the same SKU.`;
}

/** Shared BleeqUp Ranger product facts (both storefronts sell these). */
function buildRangerProductKnowledge(): string {
  const features = BLEEQUUP_FEATURE_VIDEOS.map((v) => {
    const tag = v.tag ? ` [${v.tag}]` : "";
    const desc = v.description ? ` — ${v.description}` : "";
    return `- ${v.title}${tag}${desc}`;
  }).join("\n");

  const promos = BLEEQUUP_PROMOS.map((p) => `- ${p.label}: ${p.detail}`).join("\n");

  return `## BleeqUp Ranger product facts

${BLEEQUUP_HERO.title}
${BLEEQUUP_HERO.subtitle}

Key highlights:
${promos}

Capabilities & features shoppers ask about:
${features}

Setup: Official getting-started walkthrough is available on-site (YouTube id ${BLEEQUUP_SETUP_VIDEO.youtubeId}: "${BLEEQUUP_SETUP_VIDEO.title}").`;
}

async function buildLiveCatalogKnowledge(siteId: SiteId, locale: Locale): Promise<string> {
  try {
    const products = await listStorefrontProducts({ siteId, sort: "name_asc", limit: 80 });
    if (products.length === 0) return "";

    const lines = products.map((p) => {
      const name = catalogProductName(p.slug, locale, p.name, p.translations);
      const desc = descriptionPlainText(
        catalogProductDescription(p.slug, locale, p.description ?? "", p.translations),
      ).slice(0, 220);
      const price = p.defaultPriceCad > 0 ? formatPrice(p.defaultPriceCad, "CAD") : "see product page";
      const extra = desc ? ` — ${desc}` : "";
      return `- ${name} | ${price} CAD | /products/${p.slug}${extra}`;
    });

    return `## Live catalog (this storefront, CAD)

Prices below are current list prices. If a shopper asks about a variant or sale, send them to the product page.

${lines.join("\n")}`;
  } catch (err) {
    console.error("chat catalog knowledge failed:", err);
    return "";
  }
}

function buildVerveaceStoreKnowledge(): string {
  const site = SITES.verveace;
  return `## This storefront: VerveaceSports

Identity:
- Site name: ${site.name} (${site.shortName})
- Domains: verveacesports.com / www.verveacesports.com
- Tagline: ${site.tagline}
- Description: ${site.description}
- Support email: ${site.supportEmail} (after-hours / if they ask). Immediate human help: Live Agent button in this chat.
- Free standard shipping: $${site.freeShippingOver}+ CAD
- Currency: CAD only
- Ships to: USA and Canada addresses

Catalog (multi-brand):
- BleeqUp Rover and Ranger AI sports camera glasses + accessories
- Volt Caddy remote electric golf push carts + accessories (also on voltcaddy.ca)
- MGI electric golf trolleys / carts and accessories
- Motocaddy electric golf trolleys / carts and accessories
- Related wearables and golf gear

Categories on this site: AI Glasses, Wearables, Electric Carts, Golf Gear.

BleeqUp lineup on this site:
${productList("verveace")}

Sister storefronts:
- BleeqUp Canada (ca.bleequp.com) is a separate Canada-only BleeqUp storefront (CAD, ships Canada, BleeqUp only).
- Volt Caddy (voltcaddy.ca) is a separate Canada-only Volt Caddy storefront. VerveaceSports also sells those products.
- If a Canadian shopper only wants one brand and prefers the dedicated site, you may mention it — but answer their question here first.
- Do not pretend this chat is the BleeqUp Canada or Volt Caddy assistant.`;
}

function buildVoltStoreKnowledge(): string {
  const site = SITES["volt-ca"];
  return `## This storefront: Volt Caddy

Identity:
- Site name: ${site.name}
- Domain: voltcaddy.ca
- Tagline: ${site.tagline}
- Description: ${site.description}
- Support email: ${site.supportEmail}
- Free standard shipping: $${site.freeShippingOver}+ CAD within Canada
- Market: Canada only (CAD locked)
- Ships to: Canada addresses only

Catalog (Volt Caddy only):
- Volt Caddy Pro-S remote electric golf push cart (Black or Silver), $1200 CAD
- Dual 180W motors (360W), up to 36 holes, IP54, climb up to 30 degrees, remote range up to 40 m
- Accessories are not in the catalog yet

Not sold here:
- BleeqUp glasses, MGI, Motocaddy, or any other brand

Sister storefront:
- VerveaceSports.com sells Volt Caddy plus BleeqUp, MGI, and Motocaddy, and ships to the USA and Canada.
- Do not pretend this chat is the VerveaceSports assistant.`;
}

function buildBleeqCaStoreKnowledge(): string {
  const site = SITES["bleeq-ca"];
  return `## This storefront: BleeqUp Canada

Identity:
- Site name: ${site.name} (${site.shortName})
- Domain: ca.bleequp.com
- Tagline: ${site.tagline}
- Description: ${site.description}
- Support email: ${site.supportEmail} (after-hours / if they ask). Immediate human help: Live Agent button in this chat.
- Free standard shipping: $${site.freeShippingOver}+ CAD within Canada
- Market: Canada only (CAD locked)
- Ships to: Canada addresses only (no USA shipping from this storefront)

Catalog (BleeqUp only):
- BleeqUp Rover and Ranger AI sports camera glasses
- Official BleeqUp accessories and wearables (Power Plus, Rover Power Plus, Bluetooth controller, magnetic charging wire, swappable lenses, prescription service)
- Categories on this site: AI Glasses, Wearables only

BleeqUp lineup on this site:
${productList("bleeq-ca")}

Not sold here:
- Volt Caddy, MGI, Motocaddy, golf carts/trolleys, e-bikes, or other non-BleeqUp brands

Sister storefront:
- VerveaceSports.com sells BleeqUp plus MGI & Motocaddy, and ships to USA & Canada.
- If someone asks for USA shipping, golf carts, MGI, or Motocaddy, direct them to VerveaceSports.com.
- Do not pretend this chat is the VerveaceSports multi-brand assistant.`;
}

/** Full knowledge block injected into the system prompt for the active site. */
export async function buildChatKnowledge(siteId: SiteId, locale: Locale): Promise<string> {
  let store: string;
  switch (siteId) {
    case "bleeq-ca":
      store = buildBleeqCaStoreKnowledge();
      break;
    case "volt-ca":
      store = buildVoltStoreKnowledge();
      break;
    case "verveace":
      store = buildVerveaceStoreKnowledge();
      break;
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
  const liveCatalog = await buildLiveCatalogKnowledge(siteId, locale);
  const productFacts =
    siteId === "volt-ca"
      ? ""
      : `${buildRoverProductKnowledge()}

${buildRangerProductKnowledge()}`;

  return `${store}

${productFacts}

Important:
- We are authorized retailers, not the manufacturer site (bleequp.com).
- Do not invent specs (battery minutes, weight, resolution, waterproof rating, price) unless stated above, in the live catalog, or in FAQ.
- For prescription lenses, point shoppers to the Prescription service product listing on this storefront.
- For stock or a price that is not listed, tell them to check the product page — never invent numbers.

${liveCatalog}

## FAQ (authoritative policies)

${buildFaqKnowledge(siteId)}`;
}
