"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.print();
      const url = new URL(window.location.href);
      if (url.searchParams.has("print")) {
        url.searchParams.delete("print");
        window.history.replaceState({}, "", url);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
