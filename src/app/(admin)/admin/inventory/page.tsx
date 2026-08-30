import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { adjustStockAction } from "@/app/actions/admin";
import { PageHeader, TableWrap, Th, Td, Empty } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const onlyLow = Boolean(sp.low);

  const products = await db.product.findMany({
    where: { status: { not: "ARCHIVED" }, ...(onlyLow ? { stock: { lte: 3 } } : {}) },
    orderBy: { stock: "asc" },
    take: 80,
    include: { sizeStock: { orderBy: { size: "asc" } } },
  });

  return (
    <>
      <PageHeader title="المخزون" description="تعديل الكميات لكل مقاس مع تسجيل الحركة" />
      <form className="mb-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="low" defaultChecked={onlyLow} className="size-4 accent-[var(--brand)]" />
          عرض المخزون المنخفض فقط
        </label>
      </form>

      {products.length === 0 ? (
        <Empty>لا توجد منتجات.</Empty>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-[var(--radius-lg)] border border-line bg-paper p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{p.name}</p>
                <span className={`num text-sm ${p.stock <= p.lowStockThreshold ? "text-danger" : "text-muted"}`}>
                  الإجمالي: {p.stock}
                </span>
              </div>
              <TableWrap>
                <thead>
                  <tr><Th>المقاس</Th><Th>الكمية</Th><Th>تعديل</Th></tr>
                </thead>
                <tbody>
                  {p.sizeStock.map((s) => (
                    <tr key={s.id}>
                      <Td className="num">{s.size}</Td>
                      <Td className="num">{s.quantity}</Td>
                      <Td>
                        <form action={adjustStockAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="size" value={s.size} />
                          <Input name="delta" type="number" placeholder="±" className="h-9 w-20" dir="ltr" />
                          <Select name="reason" className="h-9 w-auto">
                            <option value="RESTOCK">إعادة تخزين</option>
                            <option value="MANUAL_ADJUSTMENT">تعديل يدوي</option>
                            <option value="RETURN">إرجاع</option>
                          </Select>
                          <Button type="submit" size="sm" variant="outline">تطبيق</Button>
                        </form>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
