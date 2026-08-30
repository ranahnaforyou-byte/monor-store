import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDZD } from "@/lib/money";
import { toggleCustomerBlockAction } from "@/app/actions/admin";
import { PageHeader, Panel, TableWrap, Th, Td, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!customer) notFound();

  return (
    <>
      <PageHeader
        title={customer.name}
        description={customer.phone}
        action={
          <form action={toggleCustomerBlockAction.bind(null, customer.id)}>
            <Button type="submit" variant={customer.blocked ? "primary" : "danger"} size="sm">
              {customer.blocked ? "إلغاء الحظر" : "حظر"}
            </Button>
          </form>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Panel title="المعلومات">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">الطلبات</dt><dd className="num">{customer.ordersCount}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">إجمالي الإنفاق</dt><dd className="num">{formatDZD(customer.totalSpent)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">الولاية</dt><dd>{customer.wilayaName ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">البلدية</dt><dd>{customer.communeName ?? "—"}</dd></div>
          </dl>
          {customer.addressLine && <p className="mt-2 text-sm">{customer.addressLine}</p>}
        </Panel>
        <Panel title="سجل الطلبات">
          <TableWrap>
            <thead><tr><Th>المرجع</Th><Th>المبلغ</Th><Th>الحالة</Th><Th>التاريخ</Th></tr></thead>
            <tbody>
              {customer.orders.map((o) => (
                <tr key={o.id}>
                  <Td><Link href={`/admin/orders/${o.id}`} className="num text-brand hover:underline">{o.reference}</Link></Td>
                  <Td className="num">{formatDZD(o.total)}</Td>
                  <Td><StatusPill value={o.status} /></Td>
                  <Td className="num text-xs text-muted">{o.createdAt.toISOString().slice(0, 10)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      </div>
    </>
  );
}
