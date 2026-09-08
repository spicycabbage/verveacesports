import { cn } from "@/lib/utils";

/** Read-only — storefront is CAD-only. */
export function MarketBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground",
        className,
      )}
      title="All prices are in Canadian dollars"
    >
      <span className="hidden sm:inline">Canada</span>
      <span className="tabular-nums">CAD</span>
    </div>
  );
}
