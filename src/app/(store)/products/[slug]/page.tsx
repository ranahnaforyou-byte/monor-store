import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import {
  getProductBySlug,
  relatedProducts,
  allActiveSlugs,
} from "@/server/services/catalog";
import { getStoreSettings } from "@/server/services/settings";
import { Gallery } from "@/components/store/gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductGrid } from "@/components/store/product-grid";
import { Price } from "@/components/store/price";
import { productJsonLd, breadcrumbJsonLd, JsonLd, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await allActiveSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "المنتج غير موجود" };
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description.slice(0, 160);
  const image = product.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/products/${product.slug}`) },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(`/products/${product.slug}`),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const settings = await getStoreSettings();
  const related = await relatedProducts(product.id, product.categoryId);
  const name = locale === "fr" && product.nameFr ? product.nameFr : product.name;
  const description =
    locale === "fr" && product.descriptionFr ? product.descriptionFr : product.description;
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd
        data={productJsonLd({
          name,
          description,
          slug: product.slug,
          brand: product.brand,
          sku: product.sku,
          price: product.price,
          images: product.images.map((i) => i.url),
          inStock,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("nav.home"), url: "/" },
          { name: t("nav.shop"), url: "/products" },
          { name, url: `/products/${product.slug}` },
        ])}
      />

      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-ink">{t("nav.home")}</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-ink">{t("nav.shop")}</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-ink">
              {locale === "fr" && product.category.nameFr
                ? product.category.nameFr
                : product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery
          images={product.images.map((i) => ({
            url: i.url,
            alt: i.alt || name,
            blurDataURL: i.blurDataURL,
            width: i.width,
            height: i.height,
          }))}
          name={name}
          labels={{ prev: t("product.galleryPrev"), next: t("product.galleryNext") }}
        />

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-muted">{product.brand}</p>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{name}</h1>
            <div className="mt-3">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} locale={locale} size="lg" />
            </div>
            {product.sku && (
              <p className="mt-1 text-xs text-muted">
                {t("product.sku")}: <span className="num">{product.sku}</span>
              </p>
            )}
          </div>

          <ProductPurchase
            productId={product.id}
            sizeStock={product.sizeStock.map((s) => ({ size: s.size, quantity: s.quantity }))}
            colors={product.colors}
            labels={{
              selectSize: t("common.selectSize"),
              size: t("common.size"),
              quantity: t("common.quantity"),
              addToCart: t("common.addToCart"),
              buyNow: t("common.buyNow"),
              outOfStock: t("common.outOfStock"),
              added: t("product.addedToCart"),
              lowStock: t("common.lowStock"),
              genericError: t("errors.generic"),
            }}
          />

          <div className="rounded-[var(--radius)] border border-line bg-surface p-4 text-sm text-ink-soft">
            <p className="font-medium text-ink">{settings.codEnabled ? t("checkout.cod") : t("checkout.payment")}</p>
            <p className="mt-1">{t("product.shippingInfo")}</p>
          </div>

          {description && (
            <div className="prose-sm max-w-none">
              <h2 className="mb-2 font-display text-lg font-bold">{t("common.description")}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-xl font-bold">{t("product.relatedTitle")}</h2>
          <ProductGrid products={related} locale={locale} priorityCount={0} />
        </section>
      )}
    </div>
  );
}
