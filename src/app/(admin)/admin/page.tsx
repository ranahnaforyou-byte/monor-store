import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { getDashboardStats } from "@/server/services/stats";
import { formatDZD } from "@/lib/money";
import { PageHeader, StatCard, Panel, TableWrap, Th, Td, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const s = await getDashboardStats();

  return (
    <>
      <PageHeader title="لوحة القيادة" description="نظرة عامة على المتجر" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="مبيعات اليوم" value={formatDZD(s.revenueToday)} tone="brand" />
        <StatCard label="مبيعات 7 أيام" value={formatDZD(s.revenue7)} />
        <StatCard label="مبيعات 30 يوم" value={formatDZD(s.revenue30)} />
        <StatCard label="مستحقات الدفع عند الاستلام" value={formatDZD(s.codOutstanding)} tone="warning" />
        <StatCard label="إجمالي الطلبات" value={s.ordersTotal} />
        <StatCard label="قيد الانتظار" value={s.pending} tone={s.pending ? "warning" : "default"} />
        <StatCard label="ملغاة" value={s.cancelled} tone={s.cancelled ? "danger" : "default"} />
        <StatCard label="مخزون منخفض" value={s.lowStock} tone={s.lowStock ? "danger" : "default"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel
          title="أحدث الطلبات"
          action={<Link href="/admin/orders" className="text-xs text-brand hover:underline">عرض الكل</Link>}
        >
          {s.latestOrders.length === 0 ? (
            <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>المرجع</Th>
                  <Th>العميل</Th>
                  <Th>المبلغ</Th>
                  <Th>الحالة</Th>
                </tr>
              </thead>
              <tbody>
                {s.latestOrders.map((o) => (
                  <tr key={o.id}>
                    <Td>
                      <Link href={`/admin/orders/${o.id}`} className="num text-brand hover:underline">
                        {o.reference}
                      </Link>
                    </Td>
                    <Td>{o.customerName}</Td>
                    <Td className="num">{formatDZD(o.total)}</Td>
                    <Td><StatusPill value={o.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        <Panel title="المنتجات الأكثر مبيعاً">
          {s.topProducts.length === 0 ? (
            <p className="text-sm text-muted">لا توجد بيانات بعد.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {s.topProducts.map((p) => (
                <li key={p.name} className="flex justify-between">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="num text-muted">{p.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
