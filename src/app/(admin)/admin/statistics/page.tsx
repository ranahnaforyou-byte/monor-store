import { requireAdmin } from "@/lib/auth/guards";
import { getSalesSeries } from "@/server/services/stats";
import { formatDZD } from "@/lib/money";
import { PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { LineChart, BarList } from "@/components/admin/charts";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminStatisticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const days = sp.range === "7" ? 7 : sp.range === "90" ? 90 : 30;

  const [stats, byCategory, confVsCancel] = await Promise.all([
    getSalesSeries(days),
    db.orderItem.groupBy({
      by: ["nameSnapshot"],
      _sum: { lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 8,
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const confirmed = confVsCancel
    .filter((r) => ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(r.status))
    .reduce((s, r) => s + r._count._all, 0);
  const cancelled = confVsCancel.find((r) => r.status === "CANCELLED")?._count._all ?? 0;

  return (
    <>
      <PageHeader
        title="الإحصائيات"
        description={`آخر ${days} يوم`}
        action={
          <form className="flex gap-1 text-sm">
            {["7", "30", "90"].map((r) => (
              <button
                key={r}
                name="range"
                value={r}
                className={`rounded-[var(--radius)] border px-3 py-1 ${
                  String(days) === r ? "border-brand bg-brand-soft text-brand" : "border-line-strong"
                }`}
              >
                {r}
              </button>
            ))}
          </form>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="الإيراد" value={formatDZD(stats.revenue)} tone="brand" />
        <StatCard label="عدد الطلبات" value={stats.orderCount} />
        <StatCard label="متوسط قيمة الطلب" value={formatDZD(stats.aov)} />
        <StatCard label="مؤكد / ملغى" value={`${confirmed} / ${cancelled}`} />
      </div>

      <Panel title="الإيراد اليومي" className="mt-4">
        <LineChart data={stats.series} />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="المبيعات حسب الولاية">
          <BarList data={stats.byWilaya} />
        </Panel>
        <Panel title="المبيعات حسب طريقة الدفع">
          <BarList data={stats.byPayment} />
        </Panel>
        <Panel title="أعلى المنتجات إيراداً">
          <BarList data={byCategory.map((c) => ({ name: c.nameSnapshot, value: c._sum.lineTotal ?? 0 }))} />
        </Panel>
      </div>
    </>
  );
}
