import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDZD } from "@/lib/money";
import {
  archiveProduct,
  activateProduct,
  duplicateProductAction,
} from "@/app/actions/admin-products";
import { PageHeader, TableWrap, Th, Td, StatusPill, LinkButton, Empty } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";

  const products = await db.product.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
      ...(status === "ACTIVE" || status === "DRAFT" || status === "ARCHIVED" ? { status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { images: { where: { isPrimary: true }, take: 1 }, category: { select: { name: true } } },
  });

  return (
    <>
      <PageHeader
        title="المنتجات"
        description={`${products.length} منتج`}
        action={<LinkButton href="/admin/products/new">+ منتج جديد</LinkButton>}
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <Input name="q" defaultValue={q} placeholder="بحث بالاسم أو العلامة أو SKU" className="h-9 max-w-xs" />
        <Select name="status" defaultValue={status} className="h-9 w-auto">
          <option value="">كل الحالات</option>
          <option value="ACTIVE">منشور</option>
          <option value="DRAFT">مسودة</option>
          <option value="ARCHIVED">مؤرشف</option>
        </Select>
        <button className="h-9 rounded-[var(--radius)] border border-line-strong px-4 text-sm hover:bg-surface">
          تصفية
        </button>
      </form>

      {products.length === 0 ? (
        <Empty>لا توجد منتجات. أضف أول منتج.</Empty>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th></Th>
              <Th>المنتج</Th>
              <Th>السعر</Th>
              <Th>المخزون</Th>
              <Th>الحالة</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <Td>
                  <div className="relative h-11 w-11 overflow-hidden rounded-[var(--radius-sm)] bg-surface">
                    {p.images[0] && (
                      <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />
                    )}
                  </div>
                </Td>
                <Td>
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-brand hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {p.brand}
                    {p.category ? ` · ${p.category.name}` : ""}
                  </p>
                </Td>
                <Td className="num">{formatDZD(p.price)}</Td>
                <Td className={`num ${p.stock <= p.lowStockThreshold ? "text-danger" : ""}`}>{p.stock}</Td>
                <Td><StatusPill value={p.status} /></Td>
                <Td>
                  <div className="flex gap-1">
                    <form action={duplicateProductAction.bind(null, p.id)}>
                      <button className="rounded px-2 py-1 text-xs hover:bg-surface">نسخ</button>
                    </form>
                    {p.status === "ARCHIVED" ? (
                      <form action={activateProduct.bind(null, p.id)}>
                        <button className="rounded px-2 py-1 text-xs text-brand hover:bg-surface">تفعيل</button>
                      </form>
                    ) : (
                      <form action={archiveProduct.bind(null, p.id)}>
                        <button className="rounded px-2 py-1 text-xs text-muted hover:bg-surface">أرشفة</button>
                      </form>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
