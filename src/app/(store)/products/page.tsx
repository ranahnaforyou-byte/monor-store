import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import {
  listProducts,
  listBrands,
  type CatalogParams,
  type CatalogSort,
  type CatalogTag,
} from "@/server/services/catalog";
import { ProductGrid } from "@/components/store/product-grid";
import { CatalogControls } from "@/components/store/catalog-controls";
import { Pagination } from "@/components/store/pagination";
import { db } from "@/lib/db";

export const revalidate = 600;

type SP = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "المتجر",
  description: "تصفح كل تشكيلة أحذية كرة القدم في MONOR STORE.",
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function parseParams(sp: SP): CatalogParams {
  const sorts: CatalogSort[] = ["newest", "price-asc", "price-desc", "name-asc"];
  const sort = typeof sp.sort === "string" && sorts.includes(sp.sort as CatalogSort)
    ? (sp.sort as CatalogSort)
    : "newest";
  const tag =
    sp.tag === "new" || sp.tag === "sale" || sp.tag === "featured"
      ? (sp.tag as CatalogTag)
      : undefined;
  const min = typeof sp.min === "string" ? Number(sp.min) : NaN;
  const max = typeof sp.max === "string" ? Number(sp.max) : NaN;
  return {
    brands: toArray(sp.brand),
    sizes: toArray(sp.size),
    minPrice: Number.isFinite(min) ? Math.round(min * 100) : undefined,
    maxPrice: Number.isFinite(max) ? Math.round(max * 100) : undefined,
    inStockOnly: Boolean(sp.inStock),
    tag,
    q: typeof sp.q === "string" ? sp.q : undefined,
    sort,
    page: typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const { t, locale } = await getI18n();
  const params = parseParams(sp);

  const [result, brands, sizeRows] = await Promise.all([
    listProducts(params),
    listBrands(),
    db.product.findMany({ where: { status: "ACTIVE" }, select: { sizes: true } }),
  ]);
  const sizes = [...new Set(sizeRows.flatMap((r) => r.sizes))].sort(
    (a, b) => Number(a) - Number(b),
  );

  const makeHref = (page: number) => {
    const next = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (k === "page" || v == null) return;
      toArray(v).forEach((val) => next.append(k, val));
    });
    next.set("page", String(page));
    return `/products?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {params.tag === "new"
              ? t("nav.newArrivals")
              : params.tag === "sale"
                ? t("nav.sale")
                : t("catalog.title")}
          </h1>
          <p className="text-sm text-muted">
            {result.total} {t("common.results")}
          </p>
        </div>
        <CatalogControls
          brands={brands}
          sizes={sizes}
          labels={{
            filters: t("catalog.filters"),
            sort: t("catalog.sort"),
            sortNewest: t("catalog.sortNewest"),
            sortPriceAsc: t("catalog.sortPriceAsc"),
            sortPriceDesc: t("catalog.sortPriceDesc"),
            sortNameAsc: t("catalog.sortNameAsc"),
            priceRange: t("catalog.priceRange"),
            availability: t("catalog.availability"),
            onlyInStock: t("catalog.onlyInStock"),
            brand: t("common.brand"),
            size: t("common.size"),
            apply: t("catalog.applyFilters"),
            clear: t("catalog.clearFilters"),
            close: t("nav.close"),
          }}
        />
      </div>

      {result.items.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-line bg-surface p-10 text-center text-muted">
          {t("catalog.empty")}
        </p>
      ) : (
        <>
          <ProductGrid products={result.items} locale={locale} />
          <Pagination page={result.page} pageCount={result.pageCount} makeHref={makeHref} />
        </>
      )}
    </div>
  );
}
