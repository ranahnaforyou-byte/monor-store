import { cn } from "@/lib/utils";
import { formatDZD, discountPercent } from "@/lib/money";

export function Price({
  price,
  compareAtPrice,
  locale = "ar",
  className,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  locale?: "ar" | "fr";
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const pct = discountPercent(price, compareAtPrice ?? null);
  const priceText = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("num font-semibold text-ink", priceText)}>
        {formatDZD(price, { locale })}
      </span>
      {pct != null && (
        <>
          <span className="num text-xs text-muted line-through">
            {formatDZD(compareAtPrice as number, { locale })}
          </span>
          <span className="rounded bg-sale-soft px-1.5 py-0.5 text-[11px] font-bold text-sale">
            −{pct}%
          </span>
        </>
      )}
    </span>
  );
}
