"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { persistLocale } from "@/lib/i18n/persist-locale";

/**
 * Language alternate. A normal <a> so it stays crawlable, but a click stores
 * the locale cookie and does a full load. Client-side navigation would keep
 * serving pages cached from before the cookie changed.
 */
export function LocaleLink({
  href,
  locale,
  hrefLang,
  className,
  children,
}: {
  href: string;
  locale: Locale;
  hrefLang?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      hrefLang={hrefLang}
      className={className}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        void persistLocale(locale).finally(() => {
          window.location.assign(href);
        });
      }}
    >
      {children}
    </a>
  );
}
