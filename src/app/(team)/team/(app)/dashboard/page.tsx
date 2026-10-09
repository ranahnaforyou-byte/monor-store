import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTeamUser, isLead } from "@/lib/hanout/team-session";
import { getLeaderboard, getLeads, getOwnerKpis, getTeamMembers } from "@/server/services/hanout";
import { clock } from "@/lib/hanout/format";
import { formatDZD } from "@/lib/money";
import { Avatar } from "@/components/hanout/avatar";
import { DemoTag } from "@/components/hanout/logo";
import { ResetDemoButton } from "@/components/hanout/reset-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PIPE = [
  { key: "PENDING", label: "بانتظار التأكيد", bar: "bg-coral" },
  { key: "CONFIRMED", label: "قيد التحضير", bar: "bg-saffron" },
  { key: "PREPARING", label: "جاهز للشحن", bar: "bg-[#8fd9b8]" },
  { key: "SHIPPED", label: "في الطريق", bar: "bg-mint" },
  { key: "DELIVERED", label: "وصل وتم الدفع", bar: "bg-brand" },
  { key: "CANCELLED", label: "ملغى", bar: "bg-line-strong" },
] as const;

export default async function OwnerDashboard() {
  const user = await requireTeamUser();
  if (!isLead(user)) redirect("/team/orders");
  const [k, board, members, leads] = await Promise.all([getOwnerKpis(), getLeaderboard(), getTeamMembers(), getLeads()]);
  const max = Math.max(1, ...PIPE.map((p) => k.byStatus[p.key] ?? 0));
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Africa/Algiers" }));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted">{hour < 12 ? "صباح الخير" : "مساء الخير"}</p>
          <h1 className="font-display text-2xl font-black">{user.name.split(" ")[0]}، هذا متجرك الآن</h1>
        </div>
        <DemoTag />
      </div>

      {/* Bento */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-[var(--radius-lg)] bg-brand p-5 text-white">
          <p className="text-sm text-white/80">نسبة تأكيد الطلبات</p>
          <div className="mt-1 flex items-end gap-3">
            <span className="num font-display text-5xl font-black">{k.confirmRate}%</span>
            <span className="mb-2 text-xs text-white/80">
              من <span className="num">{k.total}</span> طلب · <span className="num">{k.selfConfirmed}</span> أكّدها الزبون بنفسه
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-saffron transition-[width] duration-700" style={{ width: `${k.confirmRate}%` }} />
          </div>
        </div>
        <Kpi label="بانتظار التأكيد" value={k.pending} tone="text-coral-strong" href="/team/orders?d=confirm" />
        <Kpi label="قيد الشحن" value={k.inShipping} tone="text-[#0f7a52]" href="/team/orders?d=ship" />
        <Kpi label="رقم الأعمال المؤكد" value={formatDZD(k.revenue)} tone="text-brand" small />
        <Kpi label="مهتمون من المعرض" value={k.leads} tone="text-[#9a6d00]" />
      </div>

      <section className="hn-card p-4">
        <h2 className="mb-3 text-sm font-bold text-ink-soft">مسار الطلبات الآن</h2>
        <ul className="space-y-2.5">
          {PIPE.map((p) => {
            const n = k.byStatus[p.key] ?? 0;
            return (
              <li key={p.key} className="grid grid-cols-[96px_1fr_28px] items-center gap-2 text-xs">
                <span className="font-semibold text-ink-soft">{p.label}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <span className={cn("block h-full rounded-full transition-[width] duration-700", p.bar)} style={{ width: `${(n / max) * 100}%` }} />
                </span>
                <span className="num text-end font-bold">{n}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="hn-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-soft">ترتيب الفريق</h2>
          <Link href="/team/staff" className="text-xs font-semibold text-brand">كل الفريق</Link>
        </div>
        <ol className="space-y-2">
          {board.map((b, i) => {
            const m = members.find((x) => x.id === b.id)!;
            return (
              <li key={b.id} className="flex items-center gap-3">
                <span className={cn("num w-5 text-center text-sm font-black", i === 0 ? "text-[#c99400]" : "text-muted")}>{i + 1}</span>
                <Avatar user={m} size="sm" />
                <span className="flex-1 text-sm font-semibold">{b.name}</span>
                <span className="text-xs text-muted">{b.dept}</span>
                <span className="num w-8 text-end text-sm font-bold text-brand">{b.score}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="leads" className="hn-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-soft">المهتمون من المعرض</h2>
          <span className="num text-sm font-black text-brand">{leads.length}</span>
        </div>
        {leads.length === 0 ? (
          <p className="text-sm text-muted">لا أحد بعد. نموذج «سجّل اهتمامك» في الصفحة الرئيسية.</p>
        ) : (
          <ul className="divide-y divide-line">
            {leads.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.name}</p>
                  <p className="truncate text-xs text-muted">
                    {l.activity}
                    {l.monthlyOrders ? ` · ${l.monthlyOrders}` : ""} · <span className="num">{clock(l.createdAt)}</span>
                  </p>
                </div>
                <a href={`tel:${l.phone}`} className="num rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">
                  {l.phone}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-muted">إعادة ضبط العرض لا تحذف هذه القائمة.</p>
      </section>

      <ResetDemoButton />
    </div>
  );
}

function Kpi({ label, value, tone, href, small }: { label: string; value: number | string; tone: string; href?: string; small?: boolean }) {
  const body = (
    <>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={cn("num mt-1 font-display font-black", small ? "text-xl" : "text-3xl", tone)}>{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="hn-card block p-4">{body}</Link>
  ) : (
    <div className="hn-card p-4">{body}</div>
  );
}
