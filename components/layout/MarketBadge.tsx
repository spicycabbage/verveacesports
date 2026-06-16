"use client";

import { useEffect, useState } from "react";
import { useCountryStore } from "@/lib/store/country";
import { COUNTRIES } from "@/lib/constants";

/** Read-only indicator — prices follow visitor location, not a manual toggle. */
export function MarketBadge() {
  const { country, currency } = useCountryStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const c = COUNTRIES[mounted ? country : "US"];

  return (
    <div
      className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground"
      title={`Prices shown in ${c.currency} based on your location`}
    >
      <span aria-hidden>{c.flag}</span>
      <span className="hidden sm:inline">{c.currency}</span>
    </div>
  );
}
