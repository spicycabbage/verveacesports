import { formatPrice } from "@/lib/utils/format";

type Props = {
  price: number;
  /** Previous CAD price. Shown struck through only when it is higher than `price`. */
  compareAt?: number | null;
  className?: string;
};

export function ProductPrice({ price, compareAt, className }: Props) {
  const showWas = compareAt != null && compareAt > price;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {showWas ? (
        <s className="text-[0.8em] font-normal text-muted-foreground tabular-nums">
          {formatPrice(compareAt, "CAD")}
        </s>
      ) : null}
      <span className={className}>{formatPrice(price, "CAD")}</span>
    </span>
  );
}
