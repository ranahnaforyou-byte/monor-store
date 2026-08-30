import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDZD } from "@/lib/money";
import { PageHeader, TableWrap, Th, Td, StatusPill, Empty } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const payment = typeof sp.payment === "string" ? sp.payment : "";

  const orders = await db.order.findMany({
    where: {
      ...(q
        ? { OR: [{ reference: { contains: q, mode: "insensitive" } }, { customerPhone: { contains: q } }, { customerName: { contains: q, mode: "insensitive" } }] }
        : {}),
      ...(status ? { status: status as never } : {}),
      ...(payment ? { paymentStatus: payment as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, reference: true, customerName: true, customerPhone: true, wilayaName: true,
      total: true, status: true, paymentStatus: true, paymentMethod: true, createdAt: true,
    },
  });

  return (
    <>
      <PageHeader title="الطلبات" description={`${orders.length} طلب`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <Input name="q" defaultValue={q} placeholder="رقم الطلب / الهاتف / الاسم" className="h-9 max-w-xs" />
        <Select name="status" defaultValue={status} className="h-9 w-auto">
          <option value="">كل الحالات</option>
          {["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select name="payment" defaultValue={payment} className="h-9 w-auto">
          <option value="">كل حالات الدفع</option>
          {["UNPAID", "PENDING", "PAID", "REFUNDED", "FAILED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <button className="h-9 rounded-[var(--radius)] border border-line-strong px-4 text-sm hover:bg-surface">تصفية</button>
      </form>

      {orders.length === 0 ? (
        <Empty>لا توجد طلبات.</Empty>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>المرجع</Th><Th>العميل</Th><Th>الولاية</Th><Th>المبلغ</Th>
              <Th>الدفع</Th><Th>الحالة</Th><Th>التاريخ</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="num text-brand hover:underline">{o.reference}</Link>
                </Td>
                <Td>
                  {o.customerName}
                  <p className="num text-xs text-muted">{o.customerPhone}</p>
                </Td>
                <Td>{o.wilayaName}</Td>
                <Td className="num">{formatDZD(o.total)}</Td>
                <Td>
                  <StatusPill value={o.paymentStatus} />
                  <span className="ms-1 text-xs text-muted">{o.paymentMethod}</span>
                </Td>
                <Td><StatusPill value={o.status} /></Td>
                <Td className="num text-xs text-muted">{o.createdAt.toISOString().slice(0, 10)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
