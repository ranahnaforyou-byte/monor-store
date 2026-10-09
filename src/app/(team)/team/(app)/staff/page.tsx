import { requireTeamUser } from "@/lib/hanout/team-session";
import { DEPARTMENTS, getLeaderboard, getTeamMembers } from "@/server/services/hanout";
import { Avatar } from "@/components/hanout/avatar";
import { DEPT_TONE } from "@/lib/hanout/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamStaffPage() {
  await requireTeamUser();
  const [members, board] = await Promise.all([getTeamMembers(), getLeaderboard()]);
  const score = new Map(board.map((b) => [b.id, b.score]));
  const leads = members.filter((m) => !m.department);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black">الفريق</h1>
        <p className="text-sm text-muted">كلّ واحد ودوره — وكل خطوة محسوبة لصاحبها.</p>
      </div>

      <section className="hn-card p-4">
        <h2 className="mb-3 text-sm font-bold text-ink-soft">الأكثر إنجازًا اليوم</h2>
        <ol className="space-y-2">
          {board.slice(0, 4).map((b, i) => {
            const m = members.find((x) => x.id === b.id)!;
            return (
              <li key={b.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "num flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
                    i === 0 ? "bg-saffron text-ink" : i === 1 ? "bg-surface-2 text-ink" : "bg-surface text-muted",
                  )}
                >
                  {i + 1}
                </span>
                <Avatar user={m} size="sm" />
                <span className="flex-1 text-sm font-semibold">{b.name}</span>
                <span className="text-xs text-muted">{b.dept}</span>
                <span className="num w-8 text-end text-sm font-bold text-brand">{b.score}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[11px] text-muted">عدد الخطوات المنجزة على الطلبات · بيانات تجريبية</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-ink-soft">الإدارة</h2>
        {leads.map((m) => (
          <div key={m.id} className="hn-card flex items-center gap-3 p-3">
            <Avatar user={m} />
            <div className="flex-1">
              <p className="text-sm font-bold">{m.name}</p>
              <p className="text-xs text-muted">{m.title}</p>
            </div>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
              {m.role === "OWNER" ? "كل الصلاحيات" : "متابعة الأقسام"}
            </span>
          </div>
        ))}
      </section>

      {DEPARTMENTS.map((d) => {
        const tone = DEPT_TONE[d.slug];
        const list = members.filter((m) => m.department?.slug === d.slug);
        return (
          <section key={d.slug} className="space-y-2">
            <h2 className={cn("inline-flex rounded-full px-3 py-1 text-sm font-bold", tone.bg, tone.fg)}>قسم {d.name}</h2>
            {list.map((m) => (
              <div key={m.id} className="hn-card flex items-center gap-3 p-3">
                <Avatar user={m} />
                <div className="flex-1">
                  <p className="text-sm font-bold">{m.name}</p>
                  <p className="text-xs text-muted">{m.title}</p>
                </div>
                <span className="text-end">
                  <span className="num block text-base font-black text-brand">{score.get(m.id) ?? 0}</span>
                  <span className="text-[10px] text-muted">خطوة</span>
                </span>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
