import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { getCategoryBySlug, listProducts, listCategories } from "@/server/services/catalog";
import { ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/store/pagination";
import { breadcrumbJsonLd, JsonLd, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await listCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "الفئة غير موجودة" };
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
    alternates: { canonical: absoluteUrl(`/categories/${category.slug}`) },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const { t, locale } = await getI18n();
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page) || 1) : 1;
  const sort =
    sp.sort === "price-asc" || sp.sort === "price-desc" || sp.sort === "name-asc"
      ? sp.sort
      : "newest";
  const result = await listProducts({ categorySlug: slug, page, sort });
  const name = locale === "fr" && category.nameFr ? category.nameFr : category.name;

  const makeHref = (p: number) => `/categories/${slug}?page=${p}`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("nav.home"), url: "/" },
          { name: t("nav.categories"), url: "/products" },
          { name, url: `/categories/${slug}` },
        ])}
      />
      <h1 className="font-display text-2xl font-bold">{name}</h1>
      {category.description && <p className="mt-1 max-w-2xl text-sm text-muted">{category.description}</p>}
      <p className="mb-6 mt-1 text-sm text-muted">
        {result.total} {t("common.results")}
      </p>

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
