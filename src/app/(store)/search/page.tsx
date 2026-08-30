import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { listProducts } from "@/server/services/catalog";
import { ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/store/pagination";
import { SearchBox } from "@/components/store/search-box";

export const metadata: Metadata = { title: "بحث", robots: { index: false } };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { t, locale } = await getI18n();
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1;

  const result = q.trim() ? await listProducts({ q, page, sort: "newest" }) : null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 font-display text-2xl font-bold">{t("nav.search")}</h1>
      <div className="max-w-xl">
        <SearchBox initial={q} placeholder={t("nav.search")} />
      </div>

      {result && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-muted">
            {result.total} {t("common.results")} — “{q}”
          </p>
          {result.items.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-line bg-surface p-10 text-center text-muted">
              {t("common.noResults")}
            </p>
          ) : (
            <>
              <ProductGrid products={result.items} locale={locale} />
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                makeHref={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
