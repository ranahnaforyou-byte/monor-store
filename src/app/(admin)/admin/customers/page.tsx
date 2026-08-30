import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDZD } from "@/lib/money";
import { PageHeader, TableWrap, Th, Td, Empty } from "@/components/admin/ui";
import { Input } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const customers = await db.customer.findMany({
    where: q ? { OR: [{ phone: { contains: q } }, { name: { contains: q, mode: "insensitive" } }] } : {},
    orderBy: { totalSpent: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader title="العملاء" description={`${customers.length} عميل`} />
      <form className="mb-4">
        <Input name="q" defaultValue={q} placeholder="بحث بالهاتف أو الاسم" className="h-9 max-w-xs" />
      </form>
      {customers.length === 0 ? (
        <Empty>لا يوجد عملاء بعد.</Empty>
      ) : (
        <TableWrap>
          <thead>
            <tr><Th>العميل</Th><Th>الهاتف</Th><Th>الولاية</Th><Th>الطلبات</Th><Th>إجمالي الإنفاق</Th><Th></Th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className={c.blocked ? "opacity-60" : ""}>
                <Td>{c.name}{c.blocked ? " (محظور)" : ""}</Td>
                <Td className="num">{c.phone}</Td>
                <Td>{c.wilayaName ?? "—"}</Td>
                <Td className="num">{c.ordersCount}</Td>
                <Td className="num">{formatDZD(c.totalSpent)}</Td>
                <Td>
                  <Link href={`/admin/customers/${c.id}`} className="text-xs text-brand hover:underline">تفاصيل</Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
