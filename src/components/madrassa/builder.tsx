"use client";

import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { PRESETS } from "./profiles";
import { encodeProfile, type Profile } from "./world";
import { Btn, card, focus, input } from "./ui";

const FIELDS: { key: keyof Profile; label: string; hint?: string; num?: boolean }[] = [
  { key: "name", label: "الاسم في العرض", hint: "اسم وهمي، مختلف بوضوح عن الاسم الحقيقي" },
  { key: "area", label: "الحي", hint: "مثل: الرويبة، باب الزوار، حيدرة" },
  { key: "levels", label: "المستويات أو التخصصات" },
  { key: "subject", label: "مادة أو تخصص العرض", hint: "تظهر في الحضور والنقاط والواجبات" },
  { key: "group", label: "القسم أو الفوج", hint: "مثل: 4 متوسط — أ، أو: إعلام آلي — فوج أ" },
  { key: "teacher", label: "اسم الأستاذ / المكوّن (وهمي)" },
  { key: "teacherTitle", label: "لقبه", hint: "الأستاذ، الأستاذة، المكوّن، المكوّنة" },
  { key: "learnerTitle", label: "اسم المتعلّم", hint: "التلميذ، المتربّص، المتعلّم" },
  { key: "fee", label: "الشهرية (دج)", num: true },
  { key: "regFee", label: "حقوق التسجيل (دج)", num: true },
  { key: "length", label: "المدة" },
  { key: "diploma", label: "الشهادة" },
  { key: "hours", label: "الدوام" },
  { key: "pupils", label: "عدد المتعلّمين تقريبًا", num: true },
];

const noop = () => () => {};

export function Builder() {
  const [p, setP] = useState<Profile>(PRESETS.qalam.profile);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const link = (q: string, view = "director") => `${origin}/madrassa/demo?view=${view}&${q}`;
  const mine = link(`p=${encodeProfile(p)}`);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("انسخ الرابط", text);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section className={cn(card, "p-4 sm:p-6")}>
        <h2 className="font-display text-xl font-black">ابدأ من قالب ثم عدّل</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setP(v.profile)} className={cn("h-9 rounded-full px-3.5 text-[13px] font-bold", focus, p.name === v.profile.name ? "bg-[#1F3C88] text-white" : v.template ? "bg-[#FEF3DC] text-[#8A5A0B]" : "bg-[#E9EEFB] text-[#1F3C88]")}>
              {v.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-bold" htmlFor="kind">النوع</label>
        <select id="kind" value={p.kind} onChange={(e) => setP({ ...p, kind: e.target.value as Profile["kind"] })} className={cn(input, "mt-1 w-full")}>
          <option value="school">مدرسة خاصة</option>
          <option value="language">مركز لغات</option>
          <option value="training">تكوين مهني (حلاقة، إعلام آلي، محاسبة…)</option>
          <option value="support">مركز دعم</option>
        </select>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-bold" htmlFor={`f-${f.key}`}>{f.label}</label>
              <input
                id={`f-${f.key}`}
                inputMode={f.num ? "numeric" : undefined}
                value={String(p[f.key])}
                onChange={(e) => setP({ ...p, [f.key]: f.num ? Number(e.target.value.replace(/\D/g, "")) || 0 : e.target.value })}
                className={cn(input, "mt-1 w-full", f.num && "num")}
              />
              {f.hint && <p className="mt-0.5 text-[12px] text-[#13294B]/70">{f.hint}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <section className="rounded-[20px] bg-[#13294B] p-5 text-white">
          <h2 className="font-display text-xl font-black">رابط العرض: {p.name}</h2>
          <p className="mt-1 text-sm text-white/75">يفتح كل الأدوار بهذه البيانات. يمكن فتح «جلسة» منه لربط هاتفين.</p>
          <p className="mt-3 break-all rounded-xl bg-white/10 p-3 text-[12px] text-white/80" dir="ltr">{mine}</p>
          <div className="mt-3 flex gap-2">
            <a href={mine} target="_blank" rel="noreferrer" className={cn("inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#F5A524] text-sm font-black text-[#13294B]", focus)}>افتح العرض</a>
            <Btn tone="ghost" className="flex-1" onClick={() => copy(mine, "mine")}>{copied === "mine" ? "نُسخ ✓" : "انسخ الرابط"}</Btn>
          </div>
        </section>

        <section className={cn(card, "p-5")}>
          <h3 className="font-display text-lg font-black">روابط قصيرة جاهزة</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {Object.entries(PRESETS)
              .filter(([, v]) => !v.template)
              .map(([k, v]) => {
                const l = link(`school=${k}`);
                return (
                  <li key={k} className="flex items-center gap-2 rounded-xl bg-[#F5F8FF] p-3">
                    <span className="min-w-0 flex-1"><b>{v.profile.name}</b><span className="block truncate text-[12px] text-[#13294B]/70" dir="ltr">…?school={k}</span></span>
                    <a href={l} target="_blank" rel="noreferrer" className={cn("text-[13px] font-bold text-[#1F3C88]", focus)}>افتح</a>
                    <button type="button" onClick={() => copy(l, k)} className={cn("text-[13px] font-bold text-[#1F3C88]", focus)}>{copied === k ? "✓" : "انسخ"}</button>
                  </li>
                );
              })}
          </ul>
        </section>

        <p className="rounded-xl bg-[#FEF3DC] p-3 text-[13px] text-[#8A5A0B]">
          استعمل أسماء وهمية فقط، ولا تضع شعار المؤسسة الحقيقية ولا عنوانها الدقيق. البيانات تبقى داخل الرابط، ولا تُحفظ في أي مكان.
        </p>
      </div>
    </div>
  );
}
