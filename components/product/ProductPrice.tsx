"use client";

import { useCountryStore } from "@/lib/store/country";
import { formatPrice } from "@/lib/utils/format";
import { useEffect, useState } from "react";

type Props = { priceUsd: number; priceCad: number; className?: string };

export function ProductPrice({ priceUsd, priceCad, className }: Props) {
  const currency = useCountryStore((s) => s.currency);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const price = !mounted ? priceUsd : currency === "CAD" ? priceCad : priceUsd;
  const cur = !mounted ? "USD" : currency;
  return <span className={className}>{formatPrice(price, cur)}</span>;
}
