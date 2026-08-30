import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

const EMPTY: ProductFormValues = {
  name: "",
  nameFr: "",
  slug: "",
  description: "",
  descriptionFr: "",
  brand: "",
  sku: "",
  categoryId: "",
  price: "",
  compareAtPrice: "",
  sizes: "40, 41, 42, 43, 44",
  colors: "",
  stockBySize: {},
  featured: false,
  newArrival: true,
  sale: false,
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
  lowStockThreshold: 3,
};

export default async function NewProductPage() {
  await requireRole("MANAGER");
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <>
      <PageHeader title="منتج جديد" description="سيتم إنشاؤه كمسودة — أضف الصور بعد الحفظ" />
      <ProductForm initial={EMPTY} categories={categories} />
    </>
  );
}
