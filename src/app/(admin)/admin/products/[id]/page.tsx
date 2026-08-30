import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/image-manager";
import { CENTIMES_PER_DZD } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("MANAGER");
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, sizeStock: true },
  });
  if (!product) notFound();

  const categories = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  const initial: ProductFormValues = {
    id: product.id,
    name: product.name,
    nameFr: product.nameFr ?? "",
    slug: product.slug,
    description: product.description,
    descriptionFr: product.descriptionFr ?? "",
    brand: product.brand,
    sku: product.sku ?? "",
    categoryId: product.categoryId ?? "",
    price: String(product.price / CENTIMES_PER_DZD),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice / CENTIMES_PER_DZD) : "",
    sizes: product.sizes.join(", "),
    colors: product.colors.join(", "),
    stockBySize: Object.fromEntries(product.sizeStock.map((s) => [s.size, s.quantity])),
    featured: product.featured,
    newArrival: product.newArrival,
    sale: product.sale,
    status: product.status,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    lowStockThreshold: product.lowStockThreshold,
  };

  return (
    <>
      <PageHeader title={product.name} description={`المخزون الكلي: ${product.stock}`} />
      <div className="space-y-6">
        <ImageManager
          productId={product.id}
          images={product.images.map((i) => ({ id: i.id, url: i.url, isPrimary: i.isPrimary }))}
        />
        <ProductForm initial={initial} categories={categories} />
      </div>
    </>
  );
}
