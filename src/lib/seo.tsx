import { siteConfig } from "@/config/site";
import { CENTIMES_PER_DZD } from "@/lib/money";

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

type ProductLdInput = {
  name: string;
  description: string;
  slug: string;
  brand: string;
  sku?: string | null;
  price: number; // centimes
  images: string[];
  inStock: boolean;
};

export function productJsonLd(p: ProductLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description.slice(0, 500),
    sku: p.sku ?? undefined,
    brand: { "@type": "Brand", name: p.brand },
    image: p.images.map((src) => (src.startsWith("http") ? src : absoluteUrl(src))),
    offers: {
      "@type": "Offer",
      priceCurrency: "DZD",
      price: (p.price / CENTIMES_PER_DZD).toFixed(2),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${p.slug}`),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
