import { formatPrice } from "@/lib/utils/format";

type Props = { price: number; className?: string };

export function ProductPrice({ price, className }: Props) {
  return <span className={className}>{formatPrice(price, "CAD")}</span>;
}
