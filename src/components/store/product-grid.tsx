import { ProductCard } from "./product-card";
import type { ProductCard as ProductCardData } from "@/server/services/catalog";
import type { Locale } from "@/lib/i18n/config";

export function ProductGrid({
  products,
  locale = "ar",
  priorityCount = 4,
}: {
  products: ProductCardData[];
  locale?: Locale;
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} locale={locale} priority={i < priorityCount} />
      ))}
    </div>
  );
}
