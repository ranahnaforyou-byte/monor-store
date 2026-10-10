import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getChannelMessages, getSpotlightOrder, getTeamMembers, shortRef } from "@/server/services/hanout";
import { SiteFooter, SiteHeader } from "@/components/hanout/site-chrome";
import { LiveRefresh } from "@/components/hanout/live-refresh";
import { Avatar } from "@/components/hanout/avatar";
import { Swash } from "@/components/hanout/logo";
import { clock } from "@/lib/hanout/format";
import { cn } from "@/lib/utils";
import { getHnLang } from "@/lib/hanout/lang";

const ST = {
  ar: {
    title: "النظام",
    motto: "كلّ واحد ودوره",
    sub: "أدوار واضحة، تواصل سلس، ومتابعة دقيقة لكل طلب.",
    chat: "محادثة الفريق",
    chatDept: "قسم التأكيد",
    system: "النظام",
    write: "اكتب رسالة لفريق القسم…",
    path: "مسار الطلب",
    pathSub: "متابعة مراحل الطلب بشكل لحظي",
    live: "مباشر",
    order: "طلب",
    products: "منتج",
    waiting: "في انتظار أول طلب…",
    pending: "في الانتظار",
    orderNo: "رقم الطلب",
    productsLabel: "المنتجات",
    customer: "العميل",
    roles: "الأدوار والصلاحيات",
    rolesSub: "كل عضو له دوره وصلاحياته المحددة",
    tryRole: "ادخل وجرّب دورًا",
    roleNames: [["مالك", "إدارة النظام"], ["مدير", "متابعة الفريق"], ["مسؤول قسم", "توزيع الطلبات"], ["موظف", "تنفيذ المهام"]],
    steps: [["تأكيد", "تم التأكيد", "قيد التأكيد"], ["تحضير", "تم التحضير", "قيد التحضير"], ["شحن", "تم الشحن", "في الانتظار"]],
  },
  en: {
    title: "The System",
    motto: "Everyone has a role",
    sub: "Clear roles, smooth communication, and precise tracking of every order.",
    chat: "Team chat",
    chatDept: "Confirmation department",
    system: "System",
    write: "Write to the department team…",
    path: "Order path",
    pathSub: "Every stage, tracked live",
    live: "Live",
    order: "Order",
    products: "items",
    waiting: "Waiting for the first order…",
    pending: "Waiting",
    orderNo: "Order no.",
    productsLabel: "Items",
    customer: "Customer",
    roles: "Roles and permissions",
    rolesSub: "Every member has a defined role and permissions",
    tryRole: "Try a role",
    roleNames: [["Owner", "Runs the system"], ["Manager", "Follows the team"], ["Department lead", "Assigns orders"], ["Staff", "Does the tasks"]],
    steps: [["Confirm", "Confirmed", "Confirming"], ["Pack", "Packed", "Packing"], ["Ship", "Shipped", "Waiting"]],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = ST[await getHnLang()];
  return { title: t.title, description: t.sub };
}
export const dynamic = "force-dynamic";

const ROLES = [
  { key: "OWNER", title: "مالك", does: "إدارة النظام", tile: "bg-brand text-white", icon: <path d="M3 18h18M4 8l4 4 4-7 4 7 4-4-2 10H6z" /> },
  { key: "MANAGER", title: "مدير", does: "متابعة الفريق", tile: "bg-saffron text-ink", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /> },
  { key: "LEAD", title: "مسؤول قسم", does: "توزيع الطلبات", tile: "bg-coral text-white", icon: <path d="M12 3v6M5 21v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 9a3 3 0 1 0 0 6M5 21h0M19 21h0" /> },
  { key: "STAFF", title: "موظف", does: "تنفيذ المهام", tile: "bg-[#3b82f6] text-white", icon: <path d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
];

const STEPS = [
  { key: "confirm", label: "تأكيد", done: "تم التأكيد", wait: "قيد التأكيد", ring: "bg-coral", soft: "bg-coral-soft" },
  { key: "prepare", label: "تحضير", done: "تم التحضير", wait: "قيد التحضير", ring: "bg-saffron", soft: "bg-saffron-soft" },
  { key: "ship", label: "شحن", done: "تم الشحن", wait: "في الانتظار", ring: "bg-mint", soft: "bg-mint-soft" },
] as const;

export default async function SystemPage() {
  const [order, messages, members] = await Promise.all([getSpotlightOrder(), getChannelMessages("confirm", 4), getTeamMembers()]);
  const pick = (email: string) => members.find((m) => m.email === email);
  const roleMembers = [pick("owner@hanout.demo"), pick("manager@hanout.demo"), pick("sara@hanout.demo"), pick("amine@hanout.demo")];

  const at = (msg: string) => order?.events.find((e) => e.message === msg)?.createdAt ?? null;
  const stepTimes = order
    ? [order.confirmedAt ?? at("PENDING → CONFIRMED"), at("CONFIRMED → PREPARING"), order.shippedAt]
    : [null, null, null];
  const current = stepTimes.findIndex((x) => !x);
  const lang = await getHnLang();
  const t = ST[lang];

  return (
    <div dir={lang === "en" ? "ltr" : "rtl"} lang={lang}>
      <LiveRefresh ms={2500} />
      <SiteHeader active="/system" lang={lang} />
      <section className="zellige">
        <div className="mx-auto max-w-[1240px] px-4 pb-6 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-[64px] font-black leading-none text-[#0d2b22] sm:text-[96px]">
            <span className="relative inline-block">
              {t.title}
              <Swash className="-bottom-2 h-[0.2em]" />
            </span>
          </h1>
          <p className="mt-6 font-display text-2xl font-black sm:text-3xl">{t.motto}</p>
          <p className="mt-2 text-ink-soft">{t.sub}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_1.25fr_1fr] lg:px-8">
        {/* Team chat (right in RTL) */}
        <div className="hn-card flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 bg-coral-soft px-5 py-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.2-4.6A8 8 0 1 1 21 12z" /></svg>
            </span>
            <div>
              <h2 className="font-display text-xl font-black">{t.chat}</h2>
              <p className="text-sm text-ink-soft">{t.chatDept}</p>
            </div>
          </div>
          <ul className="flex-1 space-y-3 p-4">
            {messages.map((m) => (
              <li key={m.id} className="flex items-start gap-3">
                {m.author ? (
                  <Avatar user={m.author} size="sm" />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01" /></svg>
                  </span>
                )}
                <div className="min-w-0 flex-1 rounded-2xl bg-surface px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span className="font-bold text-ink-soft">{m.author?.name.split(" ")[0] ?? t.system}</span>
                    <span className="num">{clock(m.createdAt)}</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/team" className="m-4 mt-0 flex h-12 items-center justify-between rounded-full border border-line-strong px-4 text-sm text-muted">
            {t.write}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>
            </span>
          </Link>
        </div>

        {/* Order path (center) */}
        <div className="hn-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="font-display text-xl font-black">{t.path}</h2>
              <p className="text-sm text-muted">{t.pathSub}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-[#0f7a52]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" /> {t.live}
            </span>
          </div>
          {order ? (
            <>
              <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl border border-line p-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {order.items[0]?.imageSnapshot && <Image src={order.items[0].imageSnapshot} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {t.order} <span className="num">{shortRef(order.reference)}</span>
                  </p>
                  <p className="truncate text-sm text-muted">
                    {order.items.reduce((n, i) => n + i.quantity, 0)} {t.products} · {order.wilayaName}
                  </p>
                </div>
                <span className="num text-sm text-muted">{clock(order.createdAt)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 px-5 py-6">
                {STEPS.map((s, i) => {
                  const done = Boolean(stepTimes[i]);
                  const isCurrent = i === current;
                  return (
                    <div key={s.key} className={cn("rounded-2xl p-3 text-center", done || isCurrent ? s.soft : "bg-surface")}>
                      <p className="font-display text-lg font-black">{t.steps[i][0]}</p>
                      <span
                        className={cn(
                          "mx-auto mt-2 flex h-11 w-11 items-center justify-center rounded-full text-white",
                          done ? s.ring : isCurrent ? `${s.ring} anim-ring` : "bg-line-strong",
                        )}
                      >
                        {done ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                        ) : (
                          <span className="text-lg font-black leading-none">…</span>
                        )}
                      </span>
                      <p className={cn("mt-2 text-xs font-bold", done ? "text-ink" : "text-muted")}>{done ? t.steps[i][1] : isCurrent ? t.steps[i][2] : t.pending}</p>
                      <p className="num mt-0.5 text-[11px] text-muted">{stepTimes[i] ? clock(stepTimes[i]!) : "--"}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mx-5 mb-5 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line text-center rtl:divide-x-reverse">
                {[
                  [t.orderNo, shortRef(order.reference)],
                  [t.productsLabel, `${order.items.length} ${t.products}`],
                  [t.customer, order.customerName.split(" ")[0]],
                ].map(([l, v]) => (
                  <div key={l} className="px-2 py-3">
                    <p className="text-[11px] text-muted">{l}</p>
                    <p className="mt-0.5 text-sm font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="p-10 text-center text-muted">{t.waiting}</p>
          )}
        </div>

        {/* Roles (left in RTL) */}
        <div className="hn-card overflow-hidden">
          <div className="bg-brand-soft px-5 py-4">
            <h2 className="font-display text-xl font-black">{t.roles}</h2>
            <p className="text-sm text-ink-soft">{t.rolesSub}</p>
          </div>
          <ul className="space-y-2.5 p-4">
            {ROLES.map((r, i) => {
              const m = roleMembers[i];
              return (
                <li key={r.key} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", r.tile)}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {r.icon}
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-lg font-black leading-tight">{t.roleNames[i][0]}</p>
                    <p className="text-sm text-muted">{t.roleNames[i][1]}</p>
                  </div>
                  {m && <Avatar user={m} />}
                </li>
              );
            })}
          </ul>
          <Link href="/team" className="mx-4 mb-4 flex h-12 items-center justify-center rounded-2xl bg-brand font-bold text-white">
            {t.tryRole}
          </Link>
        </div>
      </section>
      <SiteFooter lang={lang} />
    </div>
  );
}
