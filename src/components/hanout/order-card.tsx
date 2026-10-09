"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  teamCancel,
  teamConfirm,
  teamDelivered,
  teamOutcome,
  teamPrepared,
  teamShip,
  type TeamResult,
} from "@/app/actions/team";
import { unlockAudio } from "./chime";

export type CardOrder = {
  id: string;
  ref: string; // short "#1258"
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | string;
  customer: string;
  phone: string;
  place: string;
  total: string;
  items: string;
  itemCount: number;
  ago: string;
  isNew: boolean;
  attempts: number;
  lastOutcome: string | null;
  selfConfirmed: boolean;
  courier: string | null;
};

const OUTCOME_LABEL: Record<string, string> = {
  NO_ANSWER: "لم يرد",
  POSTPONED: "مؤجل",
  WRONG_NUMBER: "رقم خاطئ",
};

export function OrderCard({ order, couriers }: { order: CardOrder; couriers: readonly string[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [courier, setCourier] = useState(order.courier ?? couriers[0]);

  function run(fn: () => Promise<TeamResult>, okText: string) {
    unlockAudio();
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setDone(okText);
        // Cards that stay in this department (e.g. "لم يرد") get their buttons back.
        window.setTimeout(() => setDone(null), 2200);
      } else setError(res.error);
    });
  }

  const pendingDesk = order.status === "PENDING";

  return (
    <article
      className={cn(
        "hn-card anim-pop overflow-hidden transition-opacity",
        order.isNew && pendingDesk && "border-coral/60 anim-ring",
        (pending || done) && "opacity-60",
      )}
    >
      {order.isNew && pendingDesk && (
        <div className="flex items-center gap-2 bg-coral px-4 py-1.5 text-xs font-bold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          طلب جديد · {order.ago}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span className="num text-base font-bold">{order.ref}</span>
              {!order.isNew && <span className="text-xs text-muted">{order.ago}</span>}
            </p>
            <p className="mt-1 truncate text-[15px] font-semibold">{order.customer}</p>
            <p className="text-xs text-muted">{order.place}</p>
          </div>
          <div className="text-end">
            <p className="num text-base font-bold text-brand">{order.total}</p>
            <p className="text-xs text-muted">{order.itemCount} منتج · الدفع عند الاستلام</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-1 rounded-[var(--radius-sm)] bg-surface px-3 py-2 text-xs text-ink-soft">{order.items}</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {order.selfConfirmed && (
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-semibold text-[#13855c]">
              أكّده الزبون بنفسه عبر الرابط
            </span>
          )}
          {order.attempts > 0 && pendingDesk && (
            <span className="rounded-full bg-saffron-soft px-2 py-0.5 text-[11px] font-semibold text-[#9a6d00]">
              محاولات الاتصال: <span className="num">{order.attempts}</span>
              {order.lastOutcome ? ` · ${OUTCOME_LABEL[order.lastOutcome] ?? ""}` : ""}
            </span>
          )}
          {order.courier && order.status === "SHIPPED" && (
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-semibold text-[#13855c]">
              مع {order.courier}
            </span>
          )}
        </div>

        {/* Actions per department */}
        {done ? (
          <p className="mt-4 rounded-[var(--radius)] bg-mint-soft px-3 py-2.5 text-center text-sm font-semibold text-[#13855c]">
            {done}
          </p>
        ) : pendingDesk ? (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <a
                href={`tel:${order.phone}`}
                onClick={() => unlockAudio()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius)] border border-line-strong bg-paper px-4 text-sm font-semibold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                </svg>
                اتصال
              </a>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => teamConfirm(order.id), "تم التأكيد · انتقل إلى التحضير")}
                className="h-12 rounded-[var(--radius)] bg-brand text-sm font-bold text-white transition-transform active:scale-[0.98]"
              >
                تأكيد الطلب
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  ["لم يرد", () => teamOutcome(order.id, "NO_ANSWER"), "سُجّلت المحاولة"],
                  ["مؤجل", () => teamOutcome(order.id, "POSTPONED"), "سُجّل التأجيل"],
                  ["رقم خاطئ", () => teamOutcome(order.id, "WRONG_NUMBER"), "أُلغي: رقم خاطئ"],
                  ["إلغاء", () => teamCancel(order.id), "أُلغي الطلب"],
                ] as const
              ).map(([label, fn, ok]) => (
                <button
                  key={label}
                  type="button"
                  disabled={pending}
                  onClick={() => run(fn, ok)}
                  className={cn(
                    "h-10 rounded-[var(--radius-sm)] border text-xs font-semibold",
                    label === "إلغاء" || label === "رقم خاطئ"
                      ? "border-coral/40 text-coral"
                      : "border-line-strong text-ink-soft",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : order.status === "CONFIRMED" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => teamPrepared(order.id), "جاهز · انتقل إلى الشحن")}
            className="mt-4 h-12 w-full rounded-[var(--radius)] bg-saffron text-sm font-bold text-ink active:scale-[0.99]"
          >
            تم التحضير والتغليف
          </button>
        ) : order.status === "PREPARING" ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-ink-soft">شركة التوصيل</p>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {couriers.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCourier(c)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    courier === c ? "border-brand bg-brand-soft text-brand" : "border-line-strong text-ink-soft",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => teamShip(order.id, courier), `سُلّم إلى ${courier}`)}
              className="h-12 w-full rounded-[var(--radius)] bg-mint text-sm font-bold text-white active:scale-[0.99]"
            >
              تسليم الطرد لشركة التوصيل
            </button>
          </div>
        ) : order.status === "SHIPPED" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => teamDelivered(order.id), "وصل للزبون وتم الدفع")}
            className="mt-4 h-11 w-full rounded-[var(--radius)] border border-mint text-sm font-bold text-[#13855c]"
          >
            تأكيد الوصول والدفع
          </button>
        ) : null}

        {error && <p className="mt-2 text-xs font-medium text-coral">{error}</p>}
      </div>
    </article>
  );
}
