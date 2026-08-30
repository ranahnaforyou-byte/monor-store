import Image from "next/image";
import Link from "next/link";
import { Price } from "./price";
import { Badge } from "@/components/ui/primitives";
import { primaryImage, imageAlt, hasBlur, PLACEHOLDER_IMAGE } from "@/lib/images";
import type { ProductCard as ProductCardData } from "@/server/services/catalog";
import type { Locale } from "@/lib/i18n/config";

export function ProductCard({
  product,
  locale = "ar",
  priority = false,
}: {
  product: ProductCardData;
  locale?: Locale;
  priority?: boolean;
}) {
  const img = primaryImage(product.images);
  const name = locale === "fr" && product.nameFr ? product.nameFr : product.name;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={img?.url ?? PLACEHOLDER_IMAGE}
          alt={imageAlt(name, img)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          placeholder={hasBlur(img) ? "blur" : "empty"}
          blurDataURL={hasBlur(img) ? img.blurDataURL : undefined}
          priority={priority}
        />
        <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1.5">
          {product.sale && <Badge variant="sale">تخفيض</Badge>}
          {product.newArrival && <Badge variant="brand">جديد</Badge>}
          {outOfStock && <Badge variant="neutral">غير متوفر</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-xs text-muted">{product.brand}</span>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">{name}</h3>
        <div className="mt-auto pt-1">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} locale={locale} size="sm" />
        </div>
      </div>
    </Link>
  );
}
