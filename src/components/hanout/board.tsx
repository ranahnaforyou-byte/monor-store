import Image from "next/image";
import { HanoutMark } from "./logo";
import { DEPARTMENTS, getDeptCounts, getDeptOrders, shortRef, type DeptSlug } from "@/server/services/hanout";
import { timeAgo, serverNow } from "@/lib/hanout/format";
import { cn } from "@/lib/utils";
import type { HnLang } from "@/lib/hanout/lang";

const BT = {
  ar: {
    name: { confirm: "التأكيد", prepare: "التحضير", ship: "الشحن" } as Record<DeptSlug, string>,
    unit: { confirm: "طلبات جديدة", prepare: "طلبات قيد التحضير", ship: "طلبات في الطريق" } as Record<DeptSlug, string>,
    status: { confirm: "قيد التأكيد", prepare: "في التحضير", shipped: "في الطريق", ready: "جاهز للشحن" },
    nav: ["الرئيسية", "الطلبات", "المنتجات", "العملاء", "الفريق", "التقارير", "الإعدادات"],
    title: "النظام",
    search: "ابحث عن طلب، عميل أو منتج…",
    live: "مباشر",
    empty: "{t.empty}",
    brand: "حانوت",
  },
  en: {
    name: { confirm: "Confirmation", prepare: "Packing", ship: "Shipping" } as Record<DeptSlug, string>,
    unit: { confirm: "new orders", prepare: "being packed", ship: "on the way" } as Record<DeptSlug, string>,
    status: { confirm: "To confirm", prepare: "Packing", shipped: "On the way", ready: "Ready to ship" },
    nav: ["Home", "Orders", "Products", "Customers", "Team", "Reports", "Settings"],
    title: "The System",
    search: "Search an order, customer or product…",
    live: "Live",
    empty: "No orders right now",
    brand: "Hanout",
  },
};

const COL: Record<DeptSlug, { head: string; chip: string; dot: string; icon: React.ReactNode }> = {
  confirm: {
    head: "bg-coral-soft",
    chip: "bg-coral text-white",
    dot: "bg-coral",
    icon: <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />,
  },
  prepare: {
    head: "bg-saffron-soft",
    chip: "bg-saffron text-ink",
    dot: "bg-saffron",
    icon: <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
  },
  ship: {
    head: "bg-mint-soft",
    chip: "bg-mint text-white",
    dot: "bg-mint",
    icon: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  },
};

/** The «النظام» board — three department columns, live from the database. */
export async function SystemBoard({ compact = false, lang = "ar" }: { compact?: boolean; lang?: HnLang }) {
  const t = BT[lang];
  const statusOf = (slug: DeptSlug, s: string) =>
    slug === "confirm" ? t.status.confirm : slug === "prepare" ? t.status.prepare : s === "SHIPPED" ? t.status.shipped : t.status.ready;
  const counts = await getDeptCounts();
  const cols = await Promise.all(DEPARTMENTS.map(async (d) => ({ d, orders: (await getDeptOrders(d.slug)).slice(0, 3) })));
  const now = serverNow();

  return (
    <div className="flex h-full min-h-0 bg-paper text-ink">
      {!compact && (
        <aside className="hidden w-[128px] shrink-0 flex-col gap-1 bg-brand p-3 text-white/85 xl:flex">
          <div className="mb-3 flex items-center gap-1.5 px-1 text-white">
            <HanoutMark className="h-5 w-5" />
            <span className="font-display text-base font-black">{t.brand}</span>
          </div>
          {t.nav.map((l, i) => (
            <span key={l} className={cn("rounded-lg px-2.5 py-1.5 text-[12px] font-semibold", i === 1 && "bg-white/15 text-white")}>
              {l}
            </span>
          ))}
        </aside>
      )}
      <div className="min-w-0 flex-1 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-display text-lg font-black sm:text-xl">{t.title}</p>
          <span className="hidden flex-1 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-muted sm:block">
            {t.search}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-bold text-[#0f7a52]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" /> {t.live}
          </span>
        </div>
        <div className="no-scrollbar -mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {cols.map(({ d, orders }) => {
            const c = COL[d.slug];
            return (
              <div key={d.slug} className="w-[78%] shrink-0 snap-start rounded-2xl border border-line bg-surface/60 sm:w-auto">
                <div className={cn("flex items-center justify-between rounded-t-2xl px-3 py-2.5", c.head)}>
                  <div>
                    <p className="font-display text-[15px] font-black">{t.name[d.slug]}</p>
                    <p className="text-[11px] text-ink-soft">
                      <span className="num">{counts[d.slug]}</span> {t.unit[d.slug]}
                    </p>
                  </div>
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", c.chip)}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {c.icon}
                    </svg>
                  </span>
                </div>
                <ul className="space-y-2 p-2">
                  {orders.length === 0 && <li className="px-2 py-4 text-center text-[11px] text-muted">{t.empty}</li>}
                  {orders.map((o) => {
                    const fresh = o.status === "PENDING" && now - o.createdAt.getTime() < 3 * 60_000;
                    return (
                      <li
                        key={o.id}
                        className={cn("rounded-xl border border-line bg-paper p-2", fresh && "anim-pop anim-ring border-coral/60")}
                      >
                        <span className="flex items-center gap-2">
                          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                            {o.items[0]?.imageSnapshot && (
                              <Image src={o.items[0].imageSnapshot} alt="" fill sizes="32px" className="object-cover" />
                            )}
                          </span>
                          <span className="num flex-1 text-[12px] font-bold">{shortRef(o.reference)}</span>
                          <span className="text-[10px] text-muted">{timeAgo(o.createdAt, now, lang)}</span>
                        </span>
                        <span className="mt-1 block truncate text-[11px] font-semibold text-ink-soft">{o.customerName}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
                          <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
                          {statusOf(d.slug, o.status)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
