"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/constants";

type Props = {
  category: string;
  q: string;
  onCategory: (category: string) => void;
  onSearch: (q: string) => void;
};

export function ProductInventoryToolbar({ category, q: qParam, onCategory, onSearch }: Props) {
  const [q, setQ] = useState(qParam);
  // Re-sync the input when the URL param changes (React "adjust state during
  // render" pattern — no effect, no extra commit).
  const [syncedParam, setSyncedParam] = useState(qParam);
  if (syncedParam !== qParam) {
    setSyncedParam(qParam);
    setQ(qParam);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    onSearch(q);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {qParam && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onSearch("")} aria-label="Clear search">
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={!category ? "default" : "outline"}
          onClick={() => onCategory("")}
        >
          All
        </Button>
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            type="button"
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => onCategory(c)}
          >
            {categoryLabel(c)}
          </Button>
        ))}
      </div>
    </div>
  );
}
