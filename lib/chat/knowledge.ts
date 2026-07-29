import type { SiteId } from "@/lib/site/config";
import { SITES } from "@/lib/site/config";
import { faqSectionsForSite } from "@/lib/content/faq";
import {
  BLEEQUUP_HERO,
  BLEEQUUP_PROMOS,
  BLEEQUUP_FEATURE_VIDEOS,
  BLEEQUUP_SETUP_VIDEO,
} from "@/lib/content/bleequp-ai-glasses";

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
  const ranger = site.rangerProducts
    .map((p) => `- ${p.label} (slug: /products/${p.slug})`)
    .join("\n");
  const accessories = site.accessoryProducts
    .map((p) => `- ${p.label} (slug: /products/${p.slug})`)
    .join("\n");
  return `### Ranger models\n${ranger}\n\n### Accessories & services\n${accessories}`;
}

/** Shared BleeqUp Ranger product facts (both storefronts sell these). */
function buildBleeqUpProductKnowledge(): string {
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

Setup: Official getting-started walkthrough is available on-site (YouTube id ${BLEEQUUP_SETUP_VIDEO.youtubeId}: "${BLEEQUUP_SETUP_VIDEO.title}").

Important:
- We are authorized retailers, not the manufacturer site (bleequp.com).
- Do not invent specs (battery minutes, weight, resolution, waterproof rating, price) unless stated above or in FAQ.
- For prescription lenses, point shoppers to the Prescription service product listing on this storefront.
- For stock, pricing, or variant availability, tell them to check the product page — never invent numbers.`;
}

function buildVerveaceStoreKnowledge(): string {
  const site = SITES.verveace;
  return `## This storefront: VerveaceSports

Identity:
- Site name: ${site.name} (${site.shortName})
- Domains: verveacesports.com / www.verveacesports.com
- Tagline: ${site.tagline}
- Description: ${site.description}
- Support email: ${site.supportEmail}
- Free standard shipping: $${site.freeShippingOver}+ (USD or CAD matching checkout currency)
- Markets: United States (USD) and Canada (CAD)
- Ships to: USA and Canada addresses

Catalog (multi-brand):
- BleeqUp AI sports camera glasses (Ranger + accessories)
- MGI electric golf trolleys / carts and accessories
- Motocaddy electric golf trolleys / carts and accessories
- Related wearables and golf gear

Categories on this site: AI Glasses, Wearables, Electric Carts, Golf Gear.

BleeqUp lineup on this site:
${productList("verveace")}

Sister storefront:
- BleeqUp Canada (ca.bleequp.com) is a separate Canada-only BleeqUp storefront (CAD, ships Canada, BleeqUp only).
- If a Canadian shopper only wants BleeqUp Ranger / accessories and prefers the dedicated CA site, you may mention ca.bleequp.com — but answer their question here first if they are already shopping VerveaceSports.
- Do not pretend this chat is the BleeqUp Canada assistant.`;
}

function buildBleeqCaStoreKnowledge(): string {
  const site = SITES["bleeq-ca"];
  return `## This storefront: BleeqUp Canada

Identity:
- Site name: ${site.name} (${site.shortName})
- Domain: ca.bleequp.com
- Tagline: ${site.tagline}
- Description: ${site.description}
- Support email: ${site.supportEmail}
- Free standard shipping: $${site.freeShippingOver}+ CAD within Canada
- Market: Canada only (CAD locked)
- Ships to: Canada addresses only (no USA shipping from this storefront)

Catalog (BleeqUp only):
- BleeqUp Ranger AI sports camera glasses
- Official BleeqUp accessories and wearables (Power Plus, Bluetooth controller, magnetic charging wire, swappable lenses, prescription service)
- Categories on this site: AI Glasses, Wearables only

BleeqUp lineup on this site:
${productList("bleeq-ca")}

Not sold here:
- MGI, Motocaddy, golf carts/trolleys, e-bikes, or other non-BleeqUp brands

Sister storefront:
- VerveaceSports.com sells BleeqUp plus MGI & Motocaddy, and ships to USA & Canada.
- If someone asks for USA shipping, golf carts, MGI, or Motocaddy, direct them to VerveaceSports.com.
- Do not pretend this chat is the VerveaceSports multi-brand assistant.`;
}

/** Full knowledge block injected into the system prompt for the active site. */
export function buildChatKnowledge(siteId: SiteId): string {
  const store =
    siteId === "bleeq-ca"
      ? buildBleeqCaStoreKnowledge()
      : buildVerveaceStoreKnowledge();

  return `${store}

${buildBleeqUpProductKnowledge()}

## FAQ (authoritative policies)

${buildFaqKnowledge(siteId)}`;
}
