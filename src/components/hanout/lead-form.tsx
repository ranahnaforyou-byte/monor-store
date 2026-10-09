"use client";

import { useActionState } from "react";
import { createLead, type LeadState } from "@/app/actions/lead";

const ACTIVITIES = ["تاجر إلكتروني", "صانع محتوى", "حرفي", "شركة أو مقهى", "أخرى"];
const VOLUMES = ["أقل من 100 طلب", "100 – 500 طلب", "500 – 2000 طلب", "أكثر من 2000 طلب"];

export function LeadForm() {
  const [state, action, pending] = useActionState<LeadState, FormData>(createLead, {});

  if (state.ok) {
    return (
      <div className="anim-pop rounded-[var(--radius-xl)] bg-paper p-8 text-center text-ink">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint text-white">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="mt-4 font-display text-2xl font-black">وصلنا رقمك، شكرًا</p>
        <p className="mt-1 text-ink-soft">نتصل بك قريبًا لنجهّز حانوت لنشاطك.</p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-[var(--radius-xl)] bg-paper p-6 text-ink shadow-[var(--shadow-lg)]">
      <p className="font-display text-xl font-black">سجّل اهتمامك</p>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-semibold">
          الاسم
          <input name="name" required minLength={2} autoComplete="name" className="h-12 rounded-xl border border-line-strong bg-surface px-4 font-normal outline-none focus:border-brand" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          رقم الهاتف
          <input
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="0661 23 45 67"
            dir="ltr"
            className="h-12 rounded-xl border border-line-strong bg-surface px-4 text-end font-normal outline-none focus:border-brand"
          />
        </label>
        <fieldset className="grid gap-1.5">
          <legend className="mb-1 text-sm font-semibold">نوع النشاط</legend>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a, i) => (
              <label key={a} className="cursor-pointer">
                <input type="radio" name="activity" value={a} defaultChecked={i === 0} className="peer sr-only" />
                <span className="inline-flex rounded-full border border-line-strong px-3.5 py-2 text-sm font-semibold peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand">
                  {a}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1 text-sm font-semibold">
          عدد الطلبات في الشهر
          <select name="monthlyOrders" className="h-12 rounded-xl border border-line-strong bg-surface px-3 font-normal outline-none focus:border-brand">
            {VOLUMES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      {state.error && <p className="mt-3 text-sm font-semibold text-coral">{state.error}</p>}
      <button disabled={pending} className="mt-5 h-12 w-full rounded-2xl bg-saffron text-base font-black text-ink disabled:opacity-60">
        {pending ? "جارٍ الإرسال…" : "اتصلوا بي"}
      </button>
    </form>
  );
}
