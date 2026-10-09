import Link from "next/link";
import { requireTeamUser, isLead } from "@/lib/hanout/team-session";
import {
  COURIERS,
  DEPARTMENTS,
  getDeptCounts,
  getDeptOrders,
  shortRef,
  type DeptSlug,
} from "@/server/services/hanout";
import { formatDZD } from "@/lib/money";
import { timeAgo, DEPT_TONE } from "@/lib/hanout/format";
import { OrderCard } from "@/components/hanout/order-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HINT: Record<DeptSlug, string> = {
  confirm: "اتصل بالزبون وأكّد قبل الشحن — أو انتظر تأكيده عبر الرابط.",
  prepare: "جهّز المنتجات وغلّفها، ثم مرّر الطرد لقسم الشحن.",
  ship: "اختر شركة التوصيل وسلّم الطرد، ثم أكّد الوصول.",
};

export default async function TeamOrdersPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const user = await requireTeamUser();
  const { d } = await searchParams;
  const lead = isLead(user);
  const own = (user.department?.slug ?? "confirm") as DeptSlug;
  const dept: DeptSlug = lead && DEPARTMENTS.some((x) => x.slug === d) ? (d as DeptSlug) : lead ? "confirm" : own;

  const [orders, counts] = await Promise.all([getDeptOrders(dept), getDeptCounts()]);
  const now = Date.now();
  const tone = DEPT_TONE[dept];

  return (
    <div className="space-y-4">
      {lead && (
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-paper p-1.5 shadow-[var(--shadow-sm)]">
          {DEPARTMENTS.map((x) => (
            <Link
              key={x.slug}
              href={`/team/orders?d=${x.slug}`}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition-colors",
                dept === x.slug ? `${DEPT_TONE[x.slug].bg} ${DEPT_TONE[x.slug].fg}` : "text-muted",
              )}
            >
              {x.name}
              <span className="num text-xs">{counts[x.slug]}</span>
            </Link>
          ))}
        </div>
      )}

      <div className={cn("rounded-2xl px-4 py-3", tone.bg)}>
        <div className="flex items-center justify-between">
          <h1 className={cn("font-display text-2xl font-black", tone.fg)}>قسم {tone.label}</h1>
          <span className={cn("num rounded-full bg-paper px-3 py-1 text-sm font-bold", tone.fg)}>{orders.length}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft">{HINT[dept]}</p>
      </div>

      {orders.length === 0 ? (
        <div className="hn-card px-6 py-10 text-center">
          <p className="font-display text-lg font-bold">لا طلبات في هذا القسم الآن</p>
          <p className="mt-1 text-sm text-muted">كل شيء تحت السيطرة. الطلبات الجديدة تظهر هنا فورًا مع تنبيه.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard
              key={`${o.id}-${o.status}`}
              couriers={COURIERS}
              order={{
                id: o.id,
                ref: shortRef(o.reference),
                status: o.status,
                customer: o.customerName,
                phone: o.customerPhone,
                place: `${o.wilayaName} · ${o.communeName}`,
                total: formatDZD(o.total),
                items: o.items.map((i) => `${i.nameSnapshot}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join("، "),
                itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
                ago: timeAgo(o.createdAt, now),
                isNew: o.status === "PENDING" && now - o.createdAt.getTime() < 10 * 60_000,
                attempts: o.confirmAttempts,
                lastOutcome: o.lastOutcome,
                selfConfirmed: Boolean(o.customerConfirmedAt),
                courier: o.courier,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
