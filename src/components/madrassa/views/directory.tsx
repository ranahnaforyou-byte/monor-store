"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { act, fmt, useWorld } from "../store";
import { Btn, Pill, Stars, card, focus, input, useDemo } from "../ui";

type Kind = "مدرسة خاصة" | "مركز لغات" | "مركز دعم" | "تكوين مهني";
type City = "الجزائر العاصمة" | "وهران";
export type School = { id: string; name: string; kind: Kind; city: City; area: string; levels: string; fee: number; hours: string; img?: string };

export const SCHOOLS: School[] = [
  { id: "najah", name: "مدرسة الأفق", kind: "مدرسة خاصة", city: "الجزائر العاصمة", area: "حيدرة", levels: "ابتدائي، متوسط", fee: 18000, hours: "07:45 – 16:30", img: "/madrassa/school-ofoq.webp" },
  { id: "mostaqbal", name: "مدرسة المستقبل", kind: "مدرسة خاصة", city: "الجزائر العاصمة", area: "بئر مراد رايس", levels: "ابتدائي، متوسط، ثانوي", fee: 22000, hours: "08:00 – 16:00" },
  { id: "ofoq", name: "مركز آفاق للغات", kind: "مركز لغات", city: "الجزائر العاصمة", area: "باب الزوار", levels: "إنجليزية، فرنسية، ألمانية", fee: 6000, hours: "مسائي وعطلة الأسبوع", img: "/madrassa/center-afaq.webp" },
  { id: "tafawok", name: "مركز التفوق للدعم", kind: "مركز دعم", city: "وهران", area: "بئر الجير", levels: "رياضيات، فيزياء، بكالوريا", fee: 4500, hours: "مسائي" },
  { id: "itqane", name: "معهد الإتقان للتكوين", kind: "تكوين مهني", city: "وهران", area: "السانية", levels: "إعلام آلي، محاسبة، تصميم", fee: 9000, hours: "صباحي ومسائي" },
  { id: "nour-oran", name: "مدرسة النور الخاصة", kind: "مدرسة خاصة", city: "وهران", area: "وسط المدينة", levels: "ابتدائي، متوسط", fee: 17000, hours: "08:00 – 16:00" },
];
export const schoolName = (id: string) => SCHOOLS.find((s) => s.id === id)?.name ?? id;

export function DirectoryView() {
  const w = useWorld();
  const { flash } = useDemo();
  const [q, setQ] = useState("");
  const [city, setCity] = useState<"الكل" | City>("الكل");
  const [kind, setKind] = useState<"الكل" | Kind>("الكل");
  const [open, setOpen] = useState<string | null>("najah");
  const [compare, setCompare] = useState<string[]>([]);
  const [child, setChild] = useState("نور بوعلام");
  const [level, setLevel] = useState("1 متوسط");

  const rating = useMemo(() => {
    const r: Record<string, { avg: number; n: number }> = {};
    for (const s of SCHOOLS) {
      const rs = w.reviews.filter((x) => x.school === s.id);
      r[s.id] = { avg: rs.length ? rs.reduce((a, b) => a + b.stars, 0) / rs.length : 0, n: rs.length };
    }
    return r;
  }, [w.reviews]);

  const list = SCHOOLS.filter(
    (s) => (city === "الكل" || s.city === city) && (kind === "الكل" || s.kind === kind) && (!q.trim() || (s.name + s.area + s.levels).includes(q.trim())),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <section className={cn(card, "p-4 sm:p-5")}>
        <label className="relative block">
          <span className="sr-only">ابحث</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم، حيّ، مادة… مثل: حيدرة أو إنجليزية" className={cn(input, "w-full ps-10")} />
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute start-3 top-3.5 h-4 w-4 text-[#1F3C88]/60" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </label>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {(["الكل", "الجزائر العاصمة", "وهران"] as const).map((c) => (
            <button key={c} type="button" onClick={() => setCity(c)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-bold", focus, city === c ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
              {c === "الكل" ? "كل المدن" : c}
            </button>
          ))}
          <span className="mx-1 h-9 w-px shrink-0 bg-[#1F3C88]/10" />
          {(["الكل", "مدرسة خاصة", "مركز لغات", "مركز دعم", "تكوين مهني"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-bold", focus, kind === k ? "bg-[#F5A524] text-[#13294B]" : "bg-[#FEF3DC] text-[#8A5A0B]")}>
              {k === "الكل" ? "كل الأنواع" : k}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2.5">
          {list.length === 0 && <li className="rounded-2xl border border-dashed border-[#1F3C88]/15 p-5 text-center text-sm text-[#13294B]/70">لا نتيجة. جرّب «كل المدن» أو كلمة أقصر.</li>}
          {list.map((s) => {
            const isOpen = open === s.id;
            const reviews = w.reviews.filter((r) => r.school === s.id);
            return (
              <li key={s.id} className={cn("rounded-2xl border p-4", isOpen ? "border-[#1F3C88]/40 bg-[#F8FAFF]" : "border-[#1F3C88]/10")}>
                <div className="flex items-start gap-3">
                  {s.img ? (
                    <Image src={s.img} alt="" width={288} height={230} className="h-[72px] w-[88px] shrink-0 rounded-2xl object-cover sm:h-20 sm:w-[100px]" />
                  ) : (
                    <span className="flex h-[72px] w-[88px] shrink-0 items-center justify-center rounded-2xl bg-[#E9EEFB] font-display text-2xl font-black text-[#1F3C88] sm:h-20 sm:w-[100px]">{s.name.split(" ")[1]?.[0]}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-snug">{s.name}</p>
                    <p className="text-[13px] text-[#13294B]/70">{s.kind}، {s.area} — {s.city}</p>
                    <p className="mt-0.5 text-[13px] text-[#13294B]/75">{s.levels}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    {rating[s.id].n > 0 && <Stars n={rating[s.id].avg} />}
                    <p className="num mt-1 text-sm font-bold">{fmt(s.fee)}</p>
                    <p className="text-[11px] text-[#13294B]/70">في الشهر</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Btn size="sm" onClick={() => setOpen(isOpen ? null : s.id)} className="flex-1">
                    {isOpen ? "إغلاق الصفحة" : "الصفحة والتقييمات"}
                  </Btn>
                  <Btn size="sm" tone="ghost" onClick={() => setCompare((c) => (c.includes(s.id) ? c.filter((x) => x !== s.id) : [...c, s.id].slice(-3)))} className={compare.includes(s.id) ? "border-[#F5A524] bg-[#FEF3DC] text-[#8A5A0B]" : ""}>
                    {compare.includes(s.id) ? "في المقارنة" : "قارن"}
                  </Btn>
                </div>

                {isOpen && (
                  <div className="anim-pop mt-4 space-y-3 border-t border-[#1F3C88]/10 pt-4">
                    {s.id === "najah" && (
                      <div className="relative overflow-hidden rounded-2xl">
                        <Image src="/madrassa/school-ofoq-hero.webp" alt={`واجهة ${s.name} (صورة توضيحية)`} width={540} height={265} className="h-40 w-full object-cover sm:h-52" />
                        <Pill tone="green" className="absolute bottom-2 start-2">مؤسسة موثّقة</Pill>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="rounded-xl bg-white p-3 ring-1 ring-[#1F3C88]/10"><span className="block text-[12px] text-[#13294B]/70">الدوام</span><b>{s.hours}</b></p>
                      <p className="rounded-xl bg-white p-3 ring-1 ring-[#1F3C88]/10"><span className="block text-[12px] text-[#13294B]/70">الشهرية</span><b className="num">{fmt(s.fee)}</b></p>
                    </div>
                    <p className="text-sm font-bold">تقييمات موثّقة ({reviews.length})</p>
                    {reviews.map((r) => (
                      <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-[#1F3C88]/10">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#13294B]/70">
                          <span className="inline-flex items-center gap-1.5">
                            <Pill tone="green">وليّ موثّق</Pill>
                            {r.by}
                          </span>
                          <Stars n={r.stars} />
                        </div>
                        <p className="mt-1.5 text-sm">{r.text}</p>
                        {r.reply && <p className="mt-2 rounded-lg bg-[#E9EEFB] px-3 py-2 text-[13px] text-[#1F3C88]"><b>ردّ المؤسسة:</b> {r.reply}</p>}
                      </div>
                    ))}
                    <form
                      className="rounded-xl bg-[#FEF3DC] p-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!child.trim()) return;
                        act.register(s.id, s.name, child.trim(), level.trim());
                        flash(s.id === "najah" ? "أُرسل الطلب لاستقبال المدرسة — افتح «الاستقبال» أو «الولي»" : "أُرسل الطلب — تابعه من حساب الولي");
                      }}
                    >
                      <p className="mb-2 text-sm font-bold text-[#8A5A0B]">طلب تسجيل</p>
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input value={child} onChange={(e) => setChild(e.target.value)} aria-label="اسم الطفل" placeholder="اسم الطفل" className={input} />
                        <input value={level} onChange={(e) => setLevel(e.target.value)} aria-label="المستوى" placeholder="المستوى" className={input} />
                        <Btn type="submit" tone="amber">أرسل الطلب</Btn>
                      </div>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-4 lg:sticky lg:top-36 lg:h-fit">
        <section className={cn(card, "p-4 sm:p-5")}>
          <h3 className="font-display text-lg font-black">المقارنة</h3>
          {compare.length === 0 ? (
            <p className="mt-2 text-sm text-[#13294B]/70">اضغط «قارن» على مؤسستين أو ثلاث لترى الفرق جنبًا إلى جنب.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead>
                  <tr>
                    <th className="py-2 text-start"><span className="sr-only">البند</span></th>
                    {compare.map((id) => <th key={id} className="py-2 text-start font-bold">{SCHOOLS.find((s) => s.id === id)!.name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F3C88]/10">
                  {(
                    [
                      ["المدينة", (s: School) => s.city],
                      ["المستويات", (s: School) => s.levels],
                      ["الشهرية", (s: School) => fmt(s.fee)],
                      ["الدوام", (s: School) => s.hours],
                      ["التقييم", (s: School) => (rating[s.id].n ? `${rating[s.id].avg.toFixed(1)} (${rating[s.id].n})` : "—")],
                    ] as const
                  ).map(([label, get]) => (
                    <tr key={label}>
                      <td className="py-2 pe-2 text-[#13294B]/70">{label}</td>
                      {compare.map((id) => <td key={id} className="py-2 pe-2 font-semibold">{get(SCHOOLS.find((s) => s.id === id)!)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="rounded-[20px] bg-[#13294B] p-5 text-white">
          <h3 className="font-display text-lg font-black">قواعد التقييم</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/85">
            <li>يقيّم فقط وليٌّ له ابن مسجّل فعلًا في المؤسسة.</li>
            <li>المؤسسة تردّ علنًا، ولا تستطيع حذف أي تقييم.</li>
            <li>لا تقييم للأساتذة بأسمائهم.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
