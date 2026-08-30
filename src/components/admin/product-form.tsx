"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input, Textarea, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/ui";
import { saveProductAndExit } from "@/app/actions/admin-products";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  nameFr: string;
  slug: string;
  description: string;
  descriptionFr: string;
  brand: string;
  sku: string;
  categoryId: string;
  price: string; // dinar string
  compareAtPrice: string;
  sizes: string;
  colors: string;
  stockBySize: Record<string, number>;
  featured: boolean;
  newArrival: boolean;
  sale: boolean;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  seoTitle: string;
  seoDescription: string;
  lowStockThreshold: number;
};

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormValues;
  categories: Category[];
}) {
  const [sizes, setSizes] = useState(initial.sizes);
  const sizeList = sizes
    .split(/[,،\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form action={saveProductAndExit} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-4">
        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-line bg-paper p-4 sm:grid-cols-2">
          <Field label="الاسم (عربي)" htmlFor="name">
            <Input id="name" name="name" defaultValue={initial.name} required />
          </Field>
          <Field label="الاسم (فرنسي)" htmlFor="nameFr">
            <Input id="nameFr" name="nameFr" defaultValue={initial.nameFr} />
          </Field>
          <Field label="الرابط (slug)" htmlFor="slug" hint="يُولّد تلقائياً إذا تُرك فارغاً">
            <Input id="slug" name="slug" defaultValue={initial.slug} dir="ltr" />
          </Field>
          <Field label="العلامة التجارية" htmlFor="brand">
            <Input id="brand" name="brand" defaultValue={initial.brand} required />
          </Field>
          <Field label="المرجع (SKU)" htmlFor="sku">
            <Input id="sku" name="sku" defaultValue={initial.sku} dir="ltr" />
          </Field>
          <Field label="الفئة" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={initial.categoryId}>
              <option value="">— بدون فئة —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="الوصف (عربي)" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={initial.description} required rows={4} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="الوصف (فرنسي)" htmlFor="descriptionFr">
              <Textarea id="descriptionFr" name="descriptionFr" defaultValue={initial.descriptionFr} rows={3} />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-line bg-paper p-4 sm:grid-cols-2">
          <Field label="السعر (دج)" htmlFor="price">
            <Input id="price" name="price" defaultValue={initial.price} inputMode="numeric" required dir="ltr" />
          </Field>
          <Field label="السعر قبل التخفيض (دج)" htmlFor="compareAtPrice">
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              defaultValue={initial.compareAtPrice}
              inputMode="numeric"
              dir="ltr"
            />
          </Field>
          <Field label="المقاسات" htmlFor="sizes" hint="افصل بينها بفاصلة، مثال: 40, 41, 42">
            <Input
              id="sizes"
              name="sizes"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              dir="ltr"
            />
          </Field>
          <Field label="الألوان" htmlFor="colors" hint="افصل بينها بفاصلة">
            <Input id="colors" name="colors" defaultValue={initial.colors} />
          </Field>

          {sizeList.length > 0 && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-ink-soft">المخزون لكل مقاس</p>
              <div className="flex flex-wrap gap-3">
                {sizeList.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 text-sm">
                    <span className="num w-8 text-muted">{s}</span>
                    <Input
                      name={`stock_${s}`}
                      type="number"
                      min={0}
                      defaultValue={initial.stockBySize[s] ?? 0}
                      className="h-9 w-20"
                      dir="ltr"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
          <Field label="حد التنبيه للمخزون المنخفض" htmlFor="lowStockThreshold">
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={initial.lowStockThreshold}
              className="w-24"
              dir="ltr"
            />
          </Field>
        </div>

        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-line bg-paper p-4">
          <Field label="عنوان SEO" htmlFor="seoTitle">
            <Input id="seoTitle" name="seoTitle" defaultValue={initial.seoTitle} />
          </Field>
          <Field label="وصف SEO" htmlFor="seoDescription">
            <Textarea id="seoDescription" name="seoDescription" defaultValue={initial.seoDescription} rows={2} />
          </Field>
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-[var(--radius-lg)] border border-line bg-paper p-4">
        <Field label="الحالة" htmlFor="status">
          <Select id="status" name="status" defaultValue={initial.status}>
            <option value="DRAFT">مسودة</option>
            <option value="ACTIVE">منشور</option>
            <option value="ARCHIVED">مؤرشف</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-4 accent-[var(--brand)]" />
          منتج مميز
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="newArrival" defaultChecked={initial.newArrival} className="size-4 accent-[var(--brand)]" />
          وصل حديثاً
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sale" defaultChecked={initial.sale} className="size-4 accent-[var(--brand)]" />
          في التخفيضات
        </label>
        <SaveButton isEdit={Boolean(initial.id)} />
      </aside>
    </form>
  );
}

function SaveButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "جاري الحفظ…" : isEdit ? "حفظ التعديلات" : "إنشاء المنتج"}
    </Button>
  );
}
