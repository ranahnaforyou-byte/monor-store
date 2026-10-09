import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { COURIERS, shortRef } from "@/server/services/hanout";
import { SiteFooter, SiteHeader } from "@/components/hanout/site-chrome";
import { SystemBoard } from "@/components/hanout/board";
import { QrSvg } from "@/components/hanout/qr";
import { LiveRefresh } from "@/components/hanout/live-refresh";
import { LeadForm } from "@/components/hanout/lead-form";
import { HanoutMark, Swash } from "@/components/hanout/logo";
import { HANOUT_CONTACT } from "@/config/hanout";
import { timeAgo, serverNow } from "@/lib/hanout/format";

export const metadata: Metadata = {
  title: { absolute: "حانوت — كلّ واحد ودوره" },
  description: "حانوت يرتّب طلباتك وفريقك: تأكيد الطلبات تلقائيًا، أقسام وأدوار، ومحادثة لكل قسم. من أول طلب حتى التسليم.",
};
export const dynamic = "force-dynamic";

export default async function HanoutHome() {
  const latest = await db.order.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { items: { take: 1 } },
  });
  const now = serverNow();

  return (
    <>
      <LiveRefresh ms={2500} />
      <SiteHeader />

      {/* Hero */}
      <section className="zellige relative overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-12 text-center sm:px-6 md:pt-16 lg:px-8">
          <h1 className="font-display text-[56px] font-black leading-[1.05] tracking-tight text-[#0d2b22] sm:text-[84px] lg:text-[104px]">
            كلّ{" "}
            <span className="relative inline-block">
              واحد
              <Swash className="-bottom-1 h-[0.22em]" />
            </span>{" "}
            ودوره
          </h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-lg text-ink-soft sm:text-xl">
            نظام يرتّب طلباتك وفريقك.. من أول طلب حتى التسليم.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/shop" className="inline-flex h-12 items-center rounded-full bg-brand px-7 text-base font-bold text-white hover:bg-brand-hover">
              اطلب من المتجر كزبون
            </Link>
            <Link href="/team" className="inline-flex h-12 items-center rounded-full border border-line-strong bg-paper px-7 text-base font-bold">
              ادخل كأحد أفراد الفريق
            </Link>
          </div>
        </div>

        {/* Showcase: laptop board + phone + QR */}
        <div className="mx-auto max-w-[1240px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="relative grid items-end gap-6 lg:grid-cols-[220px_1fr_230px]">
            {/* QR (first in RTL = right side) */}
            <div className="hidden lg:block">
              <div className="hn-card mx-auto w-[220px] p-5 text-center">
                <p className="font-display text-lg font-black">جرّبه من هاتفك</p>
                <QrSvg path="/shop" className="mx-auto mt-3 w-[150px] rounded-lg border-2 border-brand/20 p-2 [&_svg]:h-auto [&_svg]:w-full" />
                <p className="mt-3 inline-flex rounded-full bg-surface-2 px-3 py-1 text-xs font-bold">امسح واطلب، ثم شاهد الطلب يصل هنا</p>
              </div>
            </div>

            {/* Laptop */}
            <div className="mx-auto w-full max-w-[860px]">
              <div className="rounded-[22px] bg-[#1b2421] p-2.5 shadow-[var(--shadow-lg)] sm:p-3">
                <div className="h-[330px] overflow-hidden rounded-[14px] sm:h-[380px]">
                  <SystemBoard />
                </div>
              </div>
              <div className="mx-auto h-3 w-[104%] -translate-x-[2%] rounded-b-2xl bg-gradient-to-b from-[#cfd5d2] to-[#aeb6b2] rtl:translate-x-[2%]" />
            </div>

            {/* Phone */}
            <div className="hidden lg:block">
              <div className="mx-auto w-[220px] rounded-[34px] bg-[#1b2421] p-2 shadow-[var(--shadow-lg)]">
                <div className="h-[420px] overflow-hidden rounded-[28px] bg-surface">
                  <div className="flex items-center justify-between border-b border-line bg-paper px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-brand">
                      <HanoutMark className="h-4 w-4" />
                      <span className="font-display text-sm font-black">حانوت</span>
                    </span>
                    <span className="text-[10px] font-bold text-coral">قسم التأكيد</span>
                  </div>
                  <p className="px-3 pb-1 pt-3 font-display text-base font-black">طلب جديد</p>
                  <ul className="space-y-2 px-2.5">
                    {latest.length === 0 && <li className="rounded-xl bg-paper p-3 text-center text-[11px] text-muted">في انتظار أول طلب…</li>}
                    {latest.map((o, i) => (
                      <li key={o.id} className={`anim-pop rounded-xl border bg-paper p-2.5 ${i === 0 ? "border-coral/60" : "border-line"}`}>
                        <div className="flex items-center justify-between">
                          <span className="num text-xs font-bold">{shortRef(o.reference)}</span>
                          <span className="text-[10px] text-muted">{timeAgo(o.createdAt, now)}</span>
                        </div>
                        <p className="truncate text-[12px] font-semibold">{o.customerName}</p>
                        <p className="truncate text-[10px] text-muted">{o.items[0]?.nameSnapshot}</p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-coral">
                          <span className="h-1.5 w-1.5 rounded-full bg-coral" /> قيد التأكيد
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three products */}
      <section className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <ProductCard
            id="merchants-card"
            href="#merchants"
            title="للتجار"
            line="رابط تأكيد يعمل مع أي متجر"
            pill="تأكيد الطلبات تلقائيًا"
            bg="bg-coral-soft"
            accent="bg-coral"
            icon={<path d="M4 9h16l-1.5 10.5a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5zM8 9V7a4 4 0 0 1 8 0v2" />}
          >
            <div className="rounded-xl bg-paper p-3 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <span className="num text-sm font-black">#1258</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">تم تأكيد الطلب بواسطة الزبون</p>
              <div className="mt-2 h-8 rounded-lg bg-brand text-center text-xs font-bold leading-8 text-white">نعم، أؤكد طلبي</div>
            </div>
          </ProductCard>
          <ProductCard
            id="crafts-card"
            href="#crafts"
            title="للحرفيين"
            line="أقرب حرفي، طلب، ومحادثة"
            bg="bg-mint-soft"
            accent="bg-[#13996a]"
            icon={<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />}
          >
            <div className="space-y-2 rounded-xl bg-paper p-3 shadow-[var(--shadow-sm)]">
              <p className="max-w-[85%] rounded-xl rounded-es-sm bg-surface px-3 py-1.5 text-xs">هل يمكن إصلاح تسرّب الماء اليوم؟</p>
              <p className="ms-auto max-w-[85%] rounded-xl rounded-ee-sm bg-mint-soft px-3 py-1.5 text-xs font-semibold text-[#0f7a52]">نعم، أصل بعد 30 دقيقة</p>
            </div>
          </ProductCard>
          <ProductCard
            id="business-card"
            href="#business"
            title="للشركات"
            line="قالب جاهز لتنظيم فريقك"
            bg="bg-saffron-soft"
            accent="bg-saffron"
            icon={<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />}
          >
            <div className="space-y-1.5 rounded-xl bg-paper p-3 shadow-[var(--shadow-sm)]">
              {[
                ["خالد", "مدير"],
                ["مريم", "استقبال"],
                ["يوسف", "تنفيذ"],
              ].map(([n, r]) => (
                <div key={n} className="flex items-center gap-2 text-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-soft text-[10px] font-bold text-[#9a6d00]">{n[0]}</span>
                  <span className="flex-1 font-semibold">{n}</span>
                  <span className="text-muted">{r}</span>
                </div>
              ))}
            </div>
          </ProductCard>
        </div>
      </section>

      {/* Merchants */}
      <section id="merchants" className="scroll-mt-20 bg-paper py-16">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl">
              كل طلب يُؤكَّد
              <br />
              قبل أن يُشحن
            </h2>
            <p className="mt-4 max-w-[46ch] text-ink-soft">
              أغلب الطلبات في الجزائر تُدفع عند الاستلام، والطلب غير المؤكَّد يرجع ويكلّفك. حانوت يرسل للزبون رابط تأكيد، ويضع
              كل طلب في قسمه: التأكيد، ثم التحضير، ثم الشحن — وكل خطوة تظهر في جروب القسم.
            </p>
            <ol className="mt-6 space-y-3">
              {[
                ["الزبون يطلب", "من متجرك على حانوت أو من أي متجر آخر عبر رابط التأكيد."],
                ["يؤكّد بنقرة", "أو يتصل به مؤكِّد من فريقك: لم يرد، مؤجل، رقم خاطئ — كل شيء مسجّل."],
                ["فريقك يحضّر ويشحن", "الطلب ينتقل وحده للقسم التالي، والزبون يتابعه لحظة بلحظة."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">{i + 1}</span>
                  <span>
                    <span className="block font-bold">{t}</span>
                    <span className="block text-sm text-ink-soft">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="hn-card p-6">
            <p className="text-sm font-bold text-ink-soft">شركات التوصيل في قسم الشحن</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COURIERS.map((c) => (
                <span key={c} className="rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-bold">{c}</span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["58", "ولاية"],
                ["COD", "الدفع عند الاستلام"],
                ["AR · FR", "صفحة التأكيد"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-surface p-3">
                  <p className="num font-display text-2xl font-black text-brand">{v}</p>
                  <p className="text-xs text-muted">{l}</p>
                </div>
              ))}
            </div>
            <Link href="/shop" className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-brand font-bold text-white">
              جرّب: اطلب من متجر نور
            </Link>
          </div>
        </div>
      </section>

      {/* Crafts + business */}
      <section className="mx-auto grid max-w-[1240px] gap-4 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        <div id="crafts" className="scroll-mt-20 rounded-[var(--radius-xl)] bg-mint-soft p-7">
          <span className="inline-flex rounded-full bg-paper px-3 py-1 text-xs font-bold text-[#13855c]">قريبًا</span>
          <h2 className="mt-3 font-display text-3xl font-black">للحرفيين</h2>
          <p className="mt-2 text-ink-soft">الزبون يطلب أقرب حرفي، والورشة توزّع العمل على مساعديها — بنفس النظام.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["سباكة", "كهرباء", "تكييف", "دهان", "نجارة", "تنظيف"].map((x) => (
              <span key={x} className="rounded-full bg-paper px-3 py-1.5 text-sm font-semibold">{x}</span>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-coral/40 bg-paper p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold">طلب عمل جديد · تسرّب ماء</p>
              <span className="num text-xs text-muted">2.3 كم</span>
            </div>
            <p className="text-sm text-muted">باب الزوار · اليوم 15:00</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <span className="rounded-xl bg-brand py-2 text-center text-sm font-bold text-white">قبول</span>
              <span className="rounded-xl border border-line-strong py-2 text-center text-sm font-bold">رفض</span>
            </div>
          </div>
        </div>
        <div id="business" className="scroll-mt-20 rounded-[var(--radius-xl)] bg-saffron-soft p-7">
          <span className="inline-flex rounded-full bg-paper px-3 py-1 text-xs font-bold text-[#9a6d00]">قريبًا</span>
          <h2 className="mt-3 font-display text-3xl font-black">للشركات</h2>
          <p className="mt-2 text-ink-soft">اختر قالبًا جاهزًا وحدّد الأقسام والأدوار: كل موظف يرى مهامه وجروب قسمه.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["مقهى", "مركز تكوين", "وكالة", "ورشة"].map((x) => (
              <span key={x} className="rounded-full bg-paper px-3 py-1.5 text-sm font-semibold">{x}</span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {[
              ["جديد", "bg-coral-soft text-coral"],
              ["مؤكد", "bg-paper text-ink"],
              ["قيد الإنجاز", "bg-saffron text-ink"],
              ["مكتمل", "bg-mint text-white"],
            ].map(([l, c]) => (
              <span key={l} className={`rounded-xl px-1 py-3 ${c}`}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id="start" className="scroll-mt-20 bg-brand py-16 text-white">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl">نرتّب لك فريقك؟</h2>
            <p className="mt-4 max-w-[42ch] text-white/85">اترك رقمك ونتصل بك لنجهّز حانوت لمتجرك أو ورشتك أو شركتك.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={HANOUT_CONTACT.whatsapp} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white">
                راسلنا على WhatsApp
              </a>
              <a href={HANOUT_CONTACT.telegram} target="_blank" rel="noreferrer" className="rounded-full bg-[#229ED9] px-5 py-2.5 text-sm font-bold text-white">
                Telegram
              </a>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function ProductCard({
  id,
  href,
  title,
  line,
  pill,
  bg,
  accent,
  icon,
  children,
}: {
  id: string;
  href: string;
  title: string;
  line: string;
  pill?: string;
  bg: string;
  accent: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link id={id} href={href} className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] ${bg} p-6 transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl font-black">{title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{line}</p>
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${accent}`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {icon}
          </svg>
        </span>
      </div>
      {pill && (
        <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>
          {pill}
        </span>
      )}
      <div className="mt-5">{children}</div>
      <span className={`mt-5 flex h-11 w-11 items-center justify-center rounded-full text-white ${accent}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
      </span>
    </Link>
  );
}
