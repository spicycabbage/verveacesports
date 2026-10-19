import Link from "next/link";
import Image from "next/image";
import { Check, Minus } from "lucide-react";
import {
  ROVER_COMPARE_ROW_KEYS,
  ROVER_MEDIA,
  ROVER_PRIMARY_SLUG,
  type RoverCopy,
} from "@/lib/content/bleequp-rover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANGER_SLUG = "bleequp-ranger-zeiss-lens";

function Cell({
  value,
  available,
  notAvailable,
}: {
  value: string;
  available: string;
  notAvailable: string;
}) {
  if (value === "✓") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">{available}</span>
      </span>
    );
  }
  if (value === "—") {
    return (
      <span className="inline-flex items-center justify-center text-muted-foreground/60">
        <Minus className="h-4 w-4" aria-hidden />
        <span className="sr-only">{notAvailable}</span>
      </span>
    );
  }
  return <span>{value}</span>;
}

type Props = { copy: RoverCopy["compare"]; className?: string };

export function RoverCompareTable({ copy, className }: Props) {
  return (
    <div className={cn("min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border", className)}>
      <table className="w-full table-fixed border-collapse text-xs sm:min-w-0 sm:text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th scope="col" className="w-[36%] p-2 text-left font-semibold sm:w-2/5 sm:p-4">
              {copy.featureColumn}
            </th>
            {(
              [
                { label: copy.rover, image: ROVER_MEDIA.compare.rover, slug: ROVER_PRIMARY_SLUG, cta: copy.shopRover },
                { label: copy.ranger, image: ROVER_MEDIA.compare.ranger, slug: RANGER_SLUG, cta: copy.shopRanger },
              ] as const
            ).map((col) => (
              <th key={col.slug} scope="col" className="p-2 text-center font-semibold sm:p-4">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="relative h-10 w-16 sm:h-14 sm:w-28">
                    <Image
                      src={col.image}
                      alt={col.label}
                      fill
                      sizes="112px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-base">{col.label}</span>
                  <Link
                    href={`/products/${col.slug}`}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "h-7 max-w-full px-2 text-[10px] sm:text-xs",
                    )}
                  >
                    {col.cta}
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROVER_COMPARE_ROW_KEYS.map((key) => {
            const row = copy.rows[key];
            return (
              <tr key={key} className="border-t">
                <th scope="row" className="p-2 text-left font-medium break-words sm:p-4">
                  {row.label}
                </th>
                <td className="p-2 text-center break-words sm:p-4">
                  <Cell value={row.rover} available={copy.available} notAvailable={copy.notAvailable} />
                </td>
                <td className="p-2 text-center break-words text-muted-foreground sm:p-4">
                  <Cell value={row.ranger} available={copy.available} notAvailable={copy.notAvailable} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
