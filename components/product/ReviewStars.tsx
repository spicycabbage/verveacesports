import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

export function ReviewStars({ rating, size = "sm", className, label }: Props) {
  const clamped = Math.max(0, Math.min(5, rating));
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={label ?? `${clamped} out of 5 stars`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = clamped - i;
        const filled = fill >= 0.75;
        const half = !filled && fill >= 0.25;
        return (
          <Star
            key={i}
            className={cn(
              iconClass,
              filled || half ? "text-amber-500" : "text-muted-foreground/35",
              filled && "fill-amber-500",
              half && "fill-amber-500/40",
            )}
            aria-hidden
          />
        );
      })}
    </span>
  );
}
