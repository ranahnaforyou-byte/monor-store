"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { customerCancel, customerConfirm, customerUpdateAddress } from "@/app/actions/customer-order";
import { HanoutMark, Swash } from "./logo";

export type TimelineStep = {
  key: "placed" | "confirmed" | "prepared" | "shipped" | "delivered";
  at: string | null; // pre-formatted HH:MM
  who?: string | null;
};

export type ConfirmViewProps = {
  reference: string;
  shortRef: string;
  status: string;
  store: string;
  items: { name: string; qty: number; image: string | null; size: string | null }[];
  address: string;
  place: string;
  total: string;
  totalFr: string;
  courier: string | null;
  steps: TimelineStep[];
  selfConfirmed: boolean;
  contact: { whatsapp: string; telegram: string };
};

const T = {
  ar: {
    notifTitle: "أكّد طلبك",
    notifBody: (r: string, s: string) => `طلبك ${r} من ${s} ينتظر تأكيدك`,
    now: "الآن",
    title: "أكّد طلبك",
    sub: "تأكيدك يجعل طلبك يُحضَّر فورًا ويصل أسرع.",
    qty: "الكمية",
    address: "عنوان التوصيل",
    edit: "تعديل العنوان",
    save: "حفظ العنوان",
    total: "المجموع",
    cod: "الدفع عند الاستلام",
    demo: "بيانات تجريبية",
    yes: "نعم، أؤكد طلبي",
    cancel: "إلغاء",
    cancelSure: "هل تريد إلغاء الطلب فعلًا؟",
    confirmedTitle: "شكرًا، تم تأكيد طلبك",
    confirmedSub: "فريق المتجر بدأ تحضيره. تابع طلبك هنا لحظة بلحظة.",
    shippedTitle: "طلبك في الطريق إليك",
    shippedSub: "سلّمناه لشركة التوصيل. جهّز المبلغ عند الاستلام.",
    deliveredTitle: "وصل طلبك، شكرًا لثقتك",
    deliveredSub: "نتمنى أن يعجبك. نحن هنا لأي استفسار.",
    cancelledTitle: "تم إلغاء الطلب",
    cancelledSub: "يمكنك الطلب من جديد في أي وقت.",
    track: "مسار طلبك",
    byYou: "أكّدته بنفسك",
    steps: {
      placed: "استلمنا طلبك",
      confirmed: "تم تأكيد الطلب",
      prepared: "تم تحضير الطلب وتغليفه",
      shipped: "في الطريق إليك",
      delivered: "وصل الطلب",
    },
    by: "بواسطة",
    with: "مع",
    live: "تتحدث تلقائيًا",
    contact: "تواصل مع المتجر",
    errAddress: "اكتب عنوانًا أوضح",
    errLocked: "لم يعد ممكنًا تعديل هذا الطلب",
    poweredBy: "تأكيد الطلبات بواسطة",
  },
  fr: {
    notifTitle: "Confirmez votre commande",
    notifBody: (r: string, s: string) => `Votre commande ${r} chez ${s} attend votre confirmation`,
    now: "maintenant",
    title: "Confirmer ma commande",
    sub: "Votre confirmation lance la préparation tout de suite.",
    qty: "Quantité",
    address: "Adresse de livraison",
    edit: "Modifier l'adresse",
    save: "Enregistrer",
    total: "Total",
    cod: "Paiement à la livraison",
    demo: "Données de démonstration",
    yes: "Oui, je confirme",
    cancel: "Annuler",
    cancelSure: "Voulez-vous vraiment annuler la commande ?",
    confirmedTitle: "Merci, commande confirmée",
    confirmedSub: "L'équipe prépare votre colis. Suivez-le ici en direct.",
    shippedTitle: "Votre commande est en route",
    shippedSub: "Remise au livreur. Préparez le montant à la livraison.",
    deliveredTitle: "Commande livrée, merci",
    deliveredSub: "Nous espérons qu'elle vous plaît.",
    cancelledTitle: "Commande annulée",
    cancelledSub: "Vous pouvez commander à nouveau à tout moment.",
    track: "Suivi de commande",
    byYou: "confirmée par vous",
    steps: {
      placed: "Commande reçue",
      confirmed: "Commande confirmée",
      prepared: "Colis préparé",
      shipped: "En route",
      delivered: "Livrée",
    },
    by: "par",
    with: "avec",
    live: "mise à jour en direct",
    contact: "Contacter la boutique",
    errAddress: "Adresse trop courte",
    errLocked: "Cette commande ne peut plus être modifiée",
    poweredBy: "Confirmation par",
  },
  en: {
    notifTitle: "Confirm your order",
    notifBody: (r: string, s: string) => `Your order ${r} from ${s} is waiting for your confirmation`,
    now: "now",
    title: "Confirm my order",
    sub: "Your confirmation starts the packing right away.",
    qty: "Quantity",
    address: "Delivery address",
    edit: "Edit address",
    save: "Save",
    total: "Total",
    cod: "Cash on delivery",
    demo: "Demo data",
    yes: "Yes, I confirm",
    cancel: "Cancel",
    cancelSure: "Do you really want to cancel the order?",
    confirmedTitle: "Thank you, order confirmed",
    confirmedSub: "The team is preparing your parcel. Follow it here live.",
    shippedTitle: "Your order is on its way",
    shippedSub: "Handed to the courier. Have the amount ready on delivery.",
    deliveredTitle: "Order delivered, thank you",
    deliveredSub: "We hope you love it.",
    cancelledTitle: "Order cancelled",
    cancelledSub: "You can order again anytime.",
    track: "Order tracking",
    byYou: "confirmed by you",
    steps: {
      placed: "Order received",
      confirmed: "Order confirmed",
      prepared: "Packed",
      shipped: "On the way",
      delivered: "Delivered",
    },
    by: "by",
    with: "with",
    live: "live updates",
    contact: "Contact the store",
    errAddress: "Address too short",
    errLocked: "This order can no longer be changed",
    poweredBy: "Confirmation by",
  },
} as const;

export function OrderConfirmView(p: ConfirmViewProps) {
  const [lang, setLang] = useState<"ar" | "fr" | "en">("ar");
  const t = T[lang];
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [addr, setAddr] = useState(p.address);
  const [err, setErr] = useState<string | null>(null);
  const [notif, setNotif] = useState(false);

  const isPending = p.status === "PENDING";
  const cancelled = p.status === "CANCELLED";

  useEffect(() => {
    if (!isPending) return;
    const a = window.setTimeout(() => setNotif(true), 500);
    const b = window.setTimeout(() => setNotif(false), 6500);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [isPending]);

  const reached = p.steps.filter((s) => s.at).length;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className="mx-auto max-w-[520px] px-4 pb-16 pt-5">
      {/* Simulated phone notification (real SMS / push comes later) */}
      {notif && (
        <button
          type="button"
          onClick={() => setNotif(false)}
          className="anim-slide-down fixed inset-x-0 top-3 z-50 mx-auto flex w-[calc(100%-24px)] max-w-[420px] items-start gap-3 rounded-2xl border border-white/60 bg-white/90 p-3.5 text-start shadow-[var(--shadow-lg)] backdrop-blur-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
            <HanoutMark className="h-6 w-6 [&_rect]:fill-brand" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between text-[11px] text-muted">
              <span className="font-bold text-ink">حانوت</span>
              <span>{t.now}</span>
            </span>
            <span className="block text-sm font-bold">{t.notifTitle}</span>
            <span className="block text-xs text-ink-soft">{t.notifBody(p.shortRef, p.store)}</span>
          </span>
        </button>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          {t.poweredBy}
          <span className="inline-flex items-center gap-1 text-brand">
            <HanoutMark className="h-4 w-4" /> حانوت
          </span>
        </span>
        <div className="flex rounded-full border border-line bg-paper p-0.5 text-xs font-bold">
          {(["ar", "fr", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn("rounded-full px-2.5 py-1", lang === l ? "bg-brand text-white" : "text-muted")}
            >
              {l === "ar" ? "العربية" : l === "fr" ? "Français" : "English"}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <h1 className="font-display text-[34px] font-black leading-tight">
          <span className="relative inline-block">
            {t.title}
            <Swash />
          </span>
        </h1>
      ) : (
        <div
          className={cn(
            "anim-pop rounded-[var(--radius-lg)] p-5",
            cancelled ? "bg-surface-2" : "bg-mint-soft",
          )}
        >
          <div className="flex items-center gap-3">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-full text-white", cancelled ? "bg-muted" : "bg-mint")}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                {cancelled ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M20 6 9 17l-5-5" />}
              </svg>
            </span>
            <div>
              <h1 className="font-display text-xl font-black">
                {cancelled ? t.cancelledTitle : p.status === "SHIPPED" ? t.shippedTitle : p.status === "DELIVERED" ? t.deliveredTitle : t.confirmedTitle}
              </h1>
              <p className="text-sm text-ink-soft">
                {cancelled ? t.cancelledSub : p.status === "SHIPPED" ? t.shippedSub : p.status === "DELIVERED" ? t.deliveredSub : t.confirmedSub}
              </p>
            </div>
          </div>
        </div>
      )}
      {isPending && <p className="mt-3 text-sm text-ink-soft">{t.sub}</p>}

      {/* Items */}
      <div className="mt-5 space-y-2">
        {p.items.map((it, i) => (
          <div key={i} className="hn-card flex items-center gap-3 p-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius)] bg-surface-2">
              {it.image && <Image src={it.image} alt="" fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-bold leading-snug">{it.name}</p>
              <p className="mt-1 text-sm text-muted">
                {t.qty}: <span className="num">{it.qty}</span>
                {it.size ? ` · ${it.size}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="hn-card mt-2 p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted">{t.address}</p>
            <p className="truncate text-sm font-semibold">{p.place}</p>
            <p className="truncate text-xs text-ink-soft">{addr}</p>
          </div>
        </div>
        {editing && (
          <div className="mt-3 flex gap-2">
            <input
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="h-11 flex-1 rounded-[var(--radius)] border border-line-strong bg-surface px-3 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await customerUpdateAddress(p.reference, addr);
                  if (r.ok) {
                    setEditing(false);
                    setErr(null);
                  } else setErr(r.error === "short" ? t.errAddress : t.errLocked);
                })
              }
              className="h-11 rounded-[var(--radius)] bg-brand px-4 text-sm font-bold text-white"
            >
              {t.save}
            </button>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="hn-card mt-2 flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-semibold">{t.total}</p>
          <p className="text-xs text-muted">{t.cod}</p>
        </div>
        <div className="text-end">
          <p className="num font-display text-2xl font-black">{lang === "ar" ? p.total : p.totalFr}</p>
          <p className="text-[11px] text-muted">{t.demo}</p>
        </div>
      </div>

      {isPending && (
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await customerConfirm(p.reference);
              })
            }
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand text-lg font-black text-white shadow-[0_10px_24px_-10px_rgba(11,107,79,.7)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            {t.yes}
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="h-12 rounded-2xl border border-line-strong bg-paper text-sm font-bold"
            >
              {t.edit}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(t.cancelSure)) return;
                start(async () => {
                  const r = await customerCancel(p.reference);
                  if (!r.ok) setErr(t.errLocked);
                });
              }}
              className="h-12 rounded-2xl border border-coral/50 bg-paper text-sm font-bold text-coral-strong"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
      {err && <p className="mt-2 text-center text-sm text-coral-strong">{err}</p>}

      {/* Live timeline */}
      {!cancelled && (
        <div className="hn-card mt-5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-black">{t.track}</h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0f7a52]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-mint" />
              {t.live}
            </span>
          </div>
          <ol className="relative space-y-4">
            {p.steps.map((s, i) => {
              const done = Boolean(s.at);
              const current = i === reached; // next step to happen
              return (
                <li key={s.key} className="relative flex gap-3">
                  {i < p.steps.length - 1 && (
                    <span
                      className={cn("absolute start-[13px] top-7 h-[calc(100%-4px)] w-0.5", done ? "bg-mint" : "bg-line")}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                      done ? "border-mint bg-mint text-white" : current ? "border-saffron bg-saffron-soft" : "border-line bg-paper",
                    )}
                  >
                    {done ? (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : current ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-saffron" />
                    ) : null}
                  </span>
                  <div className={cn("flex-1 pb-1", !done && !current && "opacity-50")}>
                    <p className="text-sm font-bold">{t.steps[s.key]}</p>
                    <p className="text-xs text-muted">
                      {s.at && <span className="num">{s.at}</span>}
                      {s.key === "confirmed" && s.who ? ` · ${s.who === "__you__" ? t.byYou : `${t.by} ${s.who}`}` : ""}
                      {s.key === "shipped" && p.courier && s.at ? ` · ${t.with} ${p.courier}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <a href={p.contact.whatsapp} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-sm font-bold text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1 .2-3.4-.7a11.7 11.7 0 0 1-4.6-4.1c-.4-.5-1-1.6-1-2.9s.7-2 1-2.3a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.3.5-.4.5c-.1.1-.3.3-.1.6a8.6 8.6 0 0 0 4.2 3.7c.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.2z" />
          </svg>
          WhatsApp
        </a>
        <a href={p.contact.telegram} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#229ED9] text-sm font-bold text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.6l-4.9-1.5c-1.1-.3-1.1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3z" />
          </svg>
          Telegram
        </a>
      </div>
      <p className="mt-2 text-center text-xs text-muted">{t.contact}</p>
    </div>
  );
}
