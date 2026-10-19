import type { Locale } from "@/lib/i18n/locale";
import { localeLabel } from "@/lib/i18n/locale";

const RESPONSE_LANGUAGE: Record<Locale, string> = {
  en: "English",
  nl: "Dutch (Nederlands)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  "pt-PT": "European Portuguese (Português de Portugal)",
  es: "Spanish (Español)",
  it: "Italian (Italiano)",
  ja: "Japanese (日本語)",
  "zh-CN": "Simplified Chinese (简体中文)",
};

const LATIN_HINTS: { locale: Locale; re: RegExp }[] = [
  { locale: "nl", re: /\b(ik|niet|een|van|voor|bestelling|verzending|retour)\b/i },
  { locale: "fr", re: /\b(bonjour|merci|livraison|commande|retour|vous|une)\b/i },
  { locale: "de", re: /\b(ich|nicht|eine|bestellung|versand|rückgabe|danke)\b/i },
  { locale: "es", re: /\b(hola|gracias|pedido|envío|devolución|dónde|puedo)\b/i },
  { locale: "it", re: /\b(ciao|grazie|ordine|spedizione|reso|posso|dove)\b/i },
  { locale: "pt-PT", re: /\b(olá|obrigado|encomenda|envio|devolução|posso)\b/i },
  { locale: "en", re: /\b(the|you|shipping|return|order|please|can|how)\b/i },
];

/** Best-effort locale from the shopper's latest message. */
export function detectCustomerLocale(text: string, fallback: Locale): Locale {
  const sample = text.trim();
  if (!sample) return fallback;

  if (/[\u3040-\u30ff]/.test(sample)) return "ja";
  if (/[\u4e00-\u9fff]/.test(sample)) return "zh-CN";

  for (const hint of LATIN_HINTS) {
    if (hint.re.test(sample)) return hint.locale;
  }
  return fallback;
}

export function responseLanguageName(locale: Locale): string {
  return RESPONSE_LANGUAGE[locale];
}

export function languageInstruction(opts: {
  pickerLocale: Locale;
  customerLocale: Locale;
  latestMessage: string | null;
}): string {
  const { pickerLocale, customerLocale, latestMessage } = opts;
  const replyIn = responseLanguageName(customerLocale);
  const picker = `${responseLanguageName(pickerLocale)} ("${localeLabel(pickerLocale)}")`;
  const quoted = latestMessage
    ? `Latest customer message:\n"""\n${latestMessage.slice(0, 500)}\n"""`
    : "No customer message text was detected.";

  return `Language (mandatory):
- Reply entirely in ${replyIn} — the language the customer just used.
- Do not reply in ${picker} if that differs from the customer's message.
- Use the site picker language only when the latest message is too short to tell (e.g. "ok", "?", a SKU).
- Never mix languages in one reply. Keep brand names (BleeqUp, Ranger, Rover, MGI, Motocaddy) unchanged.
${quoted}`;
}
