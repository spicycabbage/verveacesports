import type { Category } from "@/lib/constants";
import type { SiteId } from "@/lib/site/config";
import type { Dictionary } from "@/lib/i18n/messages/types";
import { interpolate } from "@/lib/i18n/dictionary";

/** Localized category label from the active dictionary. */
export function categoryLabelFromDict(dict: Dictionary, category: string): string {
  if (category in dict.categories) {
    return dict.categories[category as Category];
  }
  return category;
}

/** Build FAQ sections for a site from the message dictionary. */
export function faqSectionsFromDict(
  dict: Dictionary,
  siteId: SiteId,
  vars: { supportEmail: string; freeShippingOver: number | string },
) {
  const sections =
    siteId === "bleeq-ca" ? dict.faq.bleeqSections : dict.faq.sections;
  const tokens = {
    supportEmail: vars.supportEmail,
    freeShippingOver: String(vars.freeShippingOver),
  };
  return (Object.keys(sections) as (keyof typeof sections)[]).map((key) => {
    const section = sections[key];
    return {
      title: section.title,
      items: section.items.map((item) => ({
        question: interpolate(item.q, tokens),
        answer: interpolate(item.a, tokens),
      })),
    };
  });
}
