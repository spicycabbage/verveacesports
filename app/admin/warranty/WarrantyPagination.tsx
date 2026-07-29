import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const WARRANTY_PAGE_SIZE = 25;

type Props = {
  page: number;
  total: number;
  site?: string;
  q?: string;
};

export function WarrantyPagination({ page, total, site, q }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / WARRANTY_PAGE_SIZE));
  if (totalPages <= 1) return null;

  function href(targetPage: number) {
    const params = new URLSearchParams();
    if (site) params.set("site", site);
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/warranty?${qs}` : "/admin/warranty";
  }

  const from = (page - 1) * WARRANTY_PAGE_SIZE + 1;
  const to = Math.min(page * WARRANTY_PAGE_SIZE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          Previous
        </Link>
        <span className="text-sm tabular-nums text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Link
          href={href(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
