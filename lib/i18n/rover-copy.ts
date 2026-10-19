import type { Locale } from "@/lib/i18n/locale";
import { ROVER_COPY_EN, type RoverCopy } from "@/lib/content/bleequp-rover";
import { ROVER_COPY_DE } from "@/lib/i18n/rover/de";
import { ROVER_COPY_ES } from "@/lib/i18n/rover/es";
import { ROVER_COPY_FR } from "@/lib/i18n/rover/fr";
import { ROVER_COPY_IT } from "@/lib/i18n/rover/it";
import { ROVER_COPY_JA } from "@/lib/i18n/rover/ja";
import { ROVER_COPY_NL } from "@/lib/i18n/rover/nl";
import { ROVER_COPY_PT_PT } from "@/lib/i18n/rover/pt-PT";
import { ROVER_COPY_ZH_CN } from "@/lib/i18n/rover/zh-CN";

const OVERLAYS: Partial<Record<Locale, RoverCopy>> = {
  de: ROVER_COPY_DE,
  es: ROVER_COPY_ES,
  fr: ROVER_COPY_FR,
  it: ROVER_COPY_IT,
  ja: ROVER_COPY_JA,
  nl: ROVER_COPY_NL,
  "pt-PT": ROVER_COPY_PT_PT,
  "zh-CN": ROVER_COPY_ZH_CN,
};

export function roverCopy(locale: Locale): RoverCopy {
  return OVERLAYS[locale] ?? ROVER_COPY_EN;
}
