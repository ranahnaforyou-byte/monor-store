import Link from "next/link";
import Image from "next/image";
import { getI18n } from "@/lib/i18n/server";
import {
  featuredProducts,
  newArrivals,
  listCategories,
  listProducts,
} from "@/server/services/catalog";
import { ProductGrid } from "@/components/store/product-grid";
import { Button } from "@/components/ui/button";
import { primaryImage, PLACEHOLDER_IMAGE } from "@/lib/images";

export const revalidate = 300;

export default async function HomePage() {
  const { t, locale } = await getI18n();
  const [featured, fresh, categories, latest] = await Promise.all([
    featuredProducts(),
    newArrivals(),
    listCategories(),
    listProducts({ sort: "newest", page: 1 }),
  ]);

  const activeCategories = categories.filter((c) => c._count.products > 0);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-surface to-paper">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
          <div>
            <p className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              {t("home.trustCod")}
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 max-w-md text-ink-soft">{t("home.heroSubtitle")}</p>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg">
                <Link href="/products">{t("home.heroCta")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/products?tag=new">{t("nav.newArrivals")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface">
            <Image
              src={primaryImage(latest.items[0]?.images ?? [])?.url ?? PLACEHOLDER_IMAGE}
              alt={latest.items[0]?.name ?? "MONOR STORE"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-4 py-6 text-center text-sm sm:px-6 md:grid-cols-4 lg:px-8">
          {[t("home.trustDelivery"), t("home.trustCod"), t("home.trustOriginal"), t("home.trustSupport")].map(
            (label) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-brand">✓</span>
                <span className="text-ink-soft">{label}</span>
              </div>
            ),
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        {featured.length > 0 && (
          <Section title={t("home.featured")} href="/products?tag=featured" cta={t("common.viewAll")}>
            <ProductGrid products={featured} locale={locale} />
          </Section>
        )}

        {activeCategories.length > 0 && (
          <section>
            <h2 className="mb-5 font-display text-2xl font-bold">{t("home.shopByCategory")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {activeCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="group relative flex aspect-square items-end overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-4"
                >
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 280px"
                      className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="relative z-10 rounded-md bg-paper/90 px-2.5 py-1 text-sm font-semibold">
                    {locale === "fr" && c.nameFr ? c.nameFr : c.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {fresh.length > 0 && (
          <Section title={t("home.newArrivals")} href="/products?tag=new" cta={t("common.viewAll")}>
            <ProductGrid products={fresh} locale={locale} />
          </Section>
        )}

        {latest.items.length > 0 && (
          <Section title={t("home.allProducts")} href="/products" cta={t("common.viewAll")}>
            <ProductGrid products={latest.items.slice(0, 8)} locale={locale} />
          </Section>
        )}
      </div>
    </>
  );
}

function Section({
  title,
  href,
  cta,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <Link href={href} className="text-sm font-medium text-brand hover:underline">
          {cta}
        </Link>
      </div>
      {children}
    </section>
  );
}
