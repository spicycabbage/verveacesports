import type { SiteConfig, SiteId } from "@/lib/site/config";

export type WarrantySection = {
  title: string;
  body: string[];
  bullets?: string[];
};

export type WarrantyPolicy = {
  updated: string;
  intro: string;
  sections: WarrantySection[];
  entityNote?: string;
};

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

/** Covered hardware SKUs offered for warranty registration (lenses excluded). */
export function warrantyProductOptions(site: SiteConfig): { value: string; label: string }[] {
  const covered = [
    ...site.rangerProducts.map((p) => ({ value: p.slug, label: p.label })),
    ...site.accessoryProducts
      .filter((p) =>
        ["bleequp-power-plus", "bleequp-bluetooth-controller"].includes(p.slug),
      )
      .map((p) => ({ value: p.slug, label: p.label })),
  ];

  if (site.id === "verveace") {
    covered.push({
      value: "other-mgi-motocaddy",
      label: "Other (MGI / Motocaddy / golf gear)",
    });
  }

  return covered;
}

function bleeqPolicy(vars: Record<string, string>): WarrantyPolicy {
  return {
    updated: "July 23, 2026",
    intro: interpolate(
      "Support for your {shortName} product purchased from {name}, including troubleshooting, warranty coverage, and return options.",
      vars,
    ),
    sections: [
      {
        title: "Getting Help",
        body: [
          interpolate(
            "Please contact us at {supportEmail} if you experience any difficulties with your {shortName} product, as many issues can be resolved quickly with our assistance.",
            vars,
          ),
          "When reaching out, please include your order number, model number (SKU), serial number, a video (if available), app version (if required), and a brief description of the issue so we can assist you more efficiently.",
        ],
      },
      {
        title: "Warranty Coverage",
        body: [
          interpolate(
            "{shortName} products come with a 1-year limited warranty. This warranty covers the Ranger AI Sports Camera Glasses, Power Plus, and Bluetooth Controller. All lenses are not covered by this warranty. The warranty applies only to products purchased from {name} or other authorized BleeqUp resellers.",
            vars,
          ),
          "If a covered product is found to be defective and is still under warranty, it will be repaired or replaced at no cost to the customer (please note that all lenses are not covered).",
        ],
      },
      {
        title: "Warranty Period",
        body: [
          "The warranty takes effect from the purchase date shown on your valid proof of purchase, or the delivery date if the delivery date is later than the purchase date. A valid proof of purchase is required for any warranty claim.",
          interpolate(
            "The warranty period is subject to applicable local laws. Where Canadian consumer protection law provides a longer or more protective entitlement than the limited warranty described above, that local-law entitlement applies and prevails to the extent it is more favorable to you. {name} is an authorized BleeqUp retailer for Canada; manufacturer warranty service is coordinated through us when needed.",
            vars,
          ),
        ],
      },
      {
        title: "Warranty Shipping",
        body: [
          interpolate(
            "For warranty claims made within the first year from the effective date above (valid proof of purchase required), we will cover both inbound and outbound shipping costs within Canada. {name} is not responsible for items that are lost or damaged during inbound shipping.",
            vars,
          ),
        ],
      },
      {
        title: "What the Warranty Does Not Cover",
        body: [
          "The warranty does not cover damage caused by unauthorized disassembly or repairs, accidents, negligence, normal wear and tear, or improper use. All lenses are excluded from warranty coverage. Products purchased from unauthorized dealers or sellers are not eligible for free warranty service.",
        ],
      },
      {
        title: "Returns and Refunds",
        body: [
          interpolate(
            "For products purchased on {host}, you may request a return and refund within thirty (30) calendar days from the date of purchase — with valid proof of purchase such as the original receipt or invoice — or from the delivery date if it is later than the purchase date. The product must be unused, undamaged in appearance, with intact packaging, and must not affect resale.",
            vars,
          ),
          "Return shipping is handled as follows:",
        ],
        bullets: [
          "Non-defective returns: the return shipping cost is borne by you.",
          interpolate(
            "Defective products (manufacturing defects): {name} covers the return shipping cost.",
            vars,
          ),
        ],
      },
      {
        title: "Return Conditions",
        body: [
          "The original purchase price will be refunded to your account within thirty (30) calendar days after we receive the returned product. When applying, please return the complete set (original packaging, all accessories, and any gifts) with all labels and markings intact, along with valid proof of purchase. Returns must be sent to the address specified by us with shipping prepaid; unauthorized or cash-on-delivery returns will be refused. If the item was part of a bundled discount, we reserve the right to revoke that discount during the refund.",
          "Returns are not accepted where valid proof of purchase is missing or altered; where the request is for non-quality reasons made more than thirty (30) days after purchase or delivery; where the product, packaging, accessories, gifts, or manuals are incomplete or not intact; where defects result from human error, unauthorized modification, incorrect installation, improper use, or failure to follow official instructions; or where the returned items are not shipped within seven (7) calendar days of return confirmation. A product used within 30 days of receipt is not eligible for return without a valid reason unless it is defective.",
        ],
      },
      {
        title: "Exchanges",
        body: [
          interpolate(
            "For products purchased on {host} with a manufacturing defect, you may request a replacement within thirty (30) calendar days from the date of purchase (or delivery date if later). {name} covers the shipping cost for the replacement. Please return the complete set with valid proof of purchase; after inspection and confirmation, you will receive a new product of the same model and specifications. All lenses are excluded from exchange coverage.",
            vars,
          ),
        ],
      },
      {
        title: "Repair Costs",
        body: [
          interpolate(
            "If a covered product’s quality defect falls within the warranty scope, {name} (or the manufacturer via our coordination) covers the inspection fee, material costs, labor costs, and shipping fees. For products damaged by human factors or otherwise outside warranty coverage, you will be required to pay the repair fee, parts cost, and one-way shipping fee; if you cancel such a repair, you are responsible for the round-trip shipping costs.",
            vars,
          ),
          "The warranty period for repaired or replaced parts is three (3) months from the date of repair or replacement, or the remaining warranty period of the original product, whichever is longer (parts only, not the entire product).",
        ],
      },
      {
        title: "Damage on Arrival",
        body: [
          interpolate(
            "Please inspect your product upon receipt. If the outer packaging is damaged, refuse the delivery and have the courier return it. If the outer packaging is intact but the product inside is damaged or abnormal due to logistics, contact us at {supportEmail} within 24 hours to report the issue; otherwise it cannot be addressed.",
            vars,
          ),
        ],
      },
    ],
  };
}

function verveacePolicy(vars: Record<string, string>): WarrantyPolicy {
  return {
    updated: "July 23, 2026",
    intro: interpolate(
      "Support for products purchased from {name}, including troubleshooting, warranty coverage, and return options for BleeqUp, MGI, Motocaddy, and other eligible gear.",
      vars,
    ),
    sections: [
      {
        title: "Getting Help",
        body: [
          interpolate(
            "Please contact us at {supportEmail} if you experience any difficulties with a product purchased from {name}, as many issues can be resolved quickly with our assistance.",
            vars,
          ),
          "When reaching out, please include your order number, model number (SKU), serial number, a video (if available), app version (if required for smart devices), and a brief description of the issue so we can assist you more efficiently.",
        ],
      },
      {
        title: "Warranty Coverage",
        body: [
          interpolate(
            "{name} is an authorized retailer for BleeqUp, MGI, and Motocaddy. Manufacturer warranties apply to eligible products purchased from us.",
            vars,
          ),
          "BleeqUp products come with a 1-year limited manufacturer warranty covering the Ranger AI Sports Camera Glasses, Power Plus, and Bluetooth Controller. All lenses are not covered by this warranty. The warranty applies only to products purchased from {name} or other authorized BleeqUp resellers.",
          "MGI and Motocaddy electric trolleys and eligible accessories are covered by their respective manufacturer warranties. Contact us with your proof of purchase and we will help coordinate warranty service with the brand when needed.",
          "If a covered BleeqUp product is found to be defective and is still under warranty, it will be repaired or replaced at no cost to the customer (lenses excluded).",
        ],
      },
      {
        title: "Warranty Period",
        body: [
          "The warranty takes effect from the purchase date shown on your valid proof of purchase, or the delivery date if the delivery date is later than the purchase date. A valid proof of purchase is required for any warranty claim.",
          "The warranty period is subject to applicable local laws. Customers in the European Union and EEA may be entitled to a statutory minimum 2-year legal guarantee of conformity from the date of delivery for goods purchased for personal use. Where local law provides a longer or more protective warranty than the limited warranty described above, that local-law entitlement applies and prevails to the extent it is more favorable to you.",
        ],
      },
      {
        title: "Warranty Shipping",
        body: [
          interpolate(
            "For eligible BleeqUp warranty claims made within the first year from the effective date above (valid proof of purchase required), inbound and outbound shipping costs for approved claims are covered as arranged with our support team. {name} is not responsible for items that are lost or damaged during inbound shipping unless we arranged the carrier label.",
            vars,
          ),
          "Shipping terms for MGI and Motocaddy warranty claims follow the applicable manufacturer process; we will advise you when coordinating service.",
        ],
      },
      {
        title: "What the Warranty Does Not Cover",
        body: [
          interpolate(
            "The warranty does not cover damage caused by unauthorized disassembly or repairs, accidents, negligence, normal wear and tear, or improper use. BleeqUp lenses are excluded from warranty coverage. Products purchased from unauthorized dealers or sellers are not eligible for free warranty service through {name}.",
            vars,
          ),
        ],
      },
      {
        title: "Returns and Refunds",
        body: [
          interpolate(
            "For products purchased on {host}, you may request a return and refund within thirty (30) calendar days from the date of purchase — with valid proof of purchase such as the original receipt or invoice — or from the delivery date if it is later than the purchase date. The product must be unused, undamaged in appearance, with intact packaging, and must not affect resale.",
            vars,
          ),
          "Return shipping is handled as follows:",
        ],
        bullets: [
          "Non-defective returns: the return shipping cost is borne by you.",
          interpolate(
            "Defective products (manufacturing defects): {name} covers the return shipping cost.",
            vars,
          ),
        ],
      },
      {
        title: "Return Conditions",
        body: [
          "The original purchase price will be refunded to your account within thirty (30) calendar days after we receive the returned product. When applying, please return the complete set (original packaging, all accessories, and any gifts) with all labels and markings intact, along with valid proof of purchase. Returns must be sent to the address specified by us with shipping prepaid; unauthorized or cash-on-delivery returns will be refused. If the item was part of a bundled discount, we reserve the right to revoke that discount during the refund.",
          "Returns are not accepted where valid proof of purchase is missing or altered; where the request is for non-quality reasons made more than thirty (30) days after purchase or delivery; where the product, packaging, accessories, gifts, or manuals are incomplete or not intact; where defects result from human error, unauthorized modification, incorrect installation, improper use, or failure to follow official instructions; or where the returned items are not shipped within seven (7) calendar days of return confirmation. A product used within 30 days of receipt is not eligible for return without a valid reason unless it is defective.",
        ],
      },
      {
        title: "Exchanges",
        body: [
          interpolate(
            "For products purchased on {host} with a manufacturing defect, you may request a replacement within thirty (30) calendar days from the date of purchase (or delivery date if later). {name} covers the shipping cost for the replacement. Please return the complete set with valid proof of purchase; after inspection and confirmation, you will receive a new product of the same model and specifications. BleeqUp lenses are excluded from exchange coverage.",
            vars,
          ),
        ],
      },
      {
        title: "Repair Costs",
        body: [
          interpolate(
            "If a covered product’s quality defect falls within the warranty scope, inspection, material, labor, and shipping fees for approved claims are covered as arranged with the manufacturer or {name}. For products damaged by human factors or otherwise outside warranty coverage, you will be required to pay the repair fee, parts cost, and one-way shipping fee; if you cancel such a repair, you are responsible for the round-trip shipping costs.",
            vars,
          ),
          "For BleeqUp repairs or replacements, the warranty period for repaired or replaced parts is three (3) months from the date of repair or replacement, or the remaining warranty period of the original product, whichever is longer (parts only, not the entire product). Other brands follow their manufacturer terms.",
        ],
      },
      {
        title: "Damage on Arrival",
        body: [
          interpolate(
            "Please inspect your product upon receipt. If the outer packaging is damaged, refuse the delivery and have the courier return it. If the outer packaging is intact but the product inside is damaged or abnormal due to logistics, contact us at {supportEmail} within 24 hours to report the issue; otherwise it cannot be addressed.",
            vars,
          ),
        ],
      },
    ],
  };
}

export function getWarrantyPolicy(site: SiteConfig): WarrantyPolicy {
  const host = site.hosts[0] ?? "verveacesports.com";
  const vars = {
    name: site.name,
    shortName: site.shortName,
    host,
    supportEmail: site.supportEmail,
  };

  const id: SiteId = site.id;
  switch (id) {
    case "bleeq-ca":
      return bleeqPolicy(vars);
    case "verveace":
      return verveacePolicy(vars);
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}
