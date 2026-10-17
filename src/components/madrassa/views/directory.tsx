"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { act, fmt, useWorld } from "../store";
import { Btn, Pill, Stars, card, focus, input, useDemo } from "../ui";

type Kind = "مدرسة خاصة" | "مركز لغات" | "مركز دعم" | "تكوين مهني";
type Teacher = { name: string; subject: string; cv: string };
export type School = {
  id: string; name: string; kind: Kind; area: string; levels: string; fee: number; regFee: number; hours: string;
  length: string; diploma: string; subjects: string; coords: [number, number]; img?: string; team?: Teacher[];
};

/** Fictional institutions placed in the Algiers areas we visit first (demo data). */
export const SCHOOLS: School[] = [
  {
    id: "najah", name: "مدرسة الأفق", kind: "مدرسة خاصة", area: "حيدرة", levels: "تحضيري، ابتدائي، متوسط", fee: 18000, regFee: 15000, hours: "07:45 – 16:30",
    length: "السنة الدراسية الرسمية: 3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية: شهادة التعليم الابتدائي، شهادة التعليم المتوسط",
    subjects: "البرنامج الرسمي + إنجليزية مكثفة، إعلام آلي، نشاطات رياضية", coords: [36.742, 3.03], img: "/madrassa/school-ofoq.webp",
    team: [
      { name: "سميرة م.", subject: "الرياضيات", cv: "ليسانس رياضيات، 8 سنوات تدريس في المتوسط" },
      { name: "فريد ز.", subject: "الفيزياء", cv: "ماستر فيزياء، 5 سنوات خبرة" },
    ],
  },
  {
    id: "mostaqbal", name: "مدرسة المستقبل", kind: "مدرسة خاصة", area: "باب الزوار", levels: "ابتدائي، متوسط، ثانوي", fee: 22000, regFee: 20000, hours: "08:00 – 16:00",
    length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية حتى البكالوريا", subjects: "البرنامج الرسمي + فرنسية وإنجليزية من التحضيري", coords: [36.721, 3.183],
  },
  {
    id: "ofoq", name: "مركز آفاق للغات", kind: "مركز لغات", area: "بن عكنون", levels: "إنجليزية، فرنسية، ألمانية، تحضير IELTS", fee: 6000, regFee: 2000, hours: "مسائي وعطلة الأسبوع",
    length: "دورة 3 أشهر لكل مستوى (A1 إلى C1)", diploma: "شهادة مستوى من المركز حسب الإطار الأوروبي", subjects: "أفواج حسب اختبار المستوى، 8 إلى 12 متعلّمًا", coords: [36.759, 3.013], img: "/madrassa/center-afaq.webp",
    team: [{ name: "كريمة ب.", subject: "الإنجليزية", cv: "ماستر تعليمية اللغات، 6 سنوات خبرة" }],
  },
  {
    id: "tafawok", name: "مركز التفوق للدعم", kind: "مركز دعم", area: "باب الزوار", levels: "رياضيات، فيزياء، علوم — تحضير BEM والبكالوريا", fee: 4500, regFee: 1000, hours: "مسائي والسبت",
    length: "حسب الفصل الدراسي", diploma: "دعم مدرسي، بلا شهادة", subjects: "حصتان في الأسبوع لكل مادة، امتحانات تجريبية", coords: [36.715, 3.19],
  },
  {
    id: "itqane", name: "معهد الإتقان للتكوين المهني", kind: "تكوين مهني", area: "الرويبة", levels: "إعلام آلي، محاسبة، تصميم جرافيكي", fee: 9000, regFee: 5000, hours: "صباحي ومسائي",
    length: "6 إلى 12 شهرًا مع تربص في مؤسسة", diploma: "شهادة تكوين من مؤسسة معتمدة لدى قطاع التكوين المهني", subjects: "تطبيق على الحاسوب، مشروع نهاية التكوين", coords: [36.738, 3.281],
  },
  {
    id: "lamsa", name: "أكاديمية لمسة للحلاقة والتجميل", kind: "تكوين مهني", area: "بودواو (بومرداس)", levels: "حلاقة نسائية، تجميل، ماكياج", fee: 8000, regFee: 5000, hours: "صباحي",
    length: "6 أشهر، تطبيق يومي", diploma: "شهادة تأهيل مهني من مؤسسة معتمدة", subjects: "تطبيق على زبائن حقيقيين في صالون المدرسة", coords: [36.727, 3.41],
  },
  {
    id: "nour-oran", name: "مدرسة النور الخاصة", kind: "مدرسة خاصة", area: "دالي إبراهيم", levels: "ابتدائي، متوسط", fee: 17000, regFee: 12000, hours: "08:00 – 16:00",
    length: "3 فصول (سبتمبر – جوان)", diploma: "الامتحانات الرسمية: الابتدائي والمتوسط", subjects: "البرنامج الرسمي + نادي علوم وقراءة", coords: [36.754, 2.988],
  },
];
const AREAS = ["الكل", "حيدرة", "بن عكنون", "دالي إبراهيم", "باب الزوار", "الرويبة", "بودواو (بومرداس)"] as const;
export const schoolName = (id: string) => SCHOOLS.find((s) => s.id === id)?.name ?? id;

export function DirectoryView() {
  const w = useWorld();
  const { flash } = useDemo();
  const [q, setQ] = useState("");
  const [city, setCity] = useState<(typeof AREAS)[number]>("الكل");
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
    (s) => (city === "الكل" || s.area === city) && (kind === "الكل" || s.kind === kind) && (!q.trim() || (s.name + s.area + s.levels).includes(q.trim())),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <section className={cn(card, "p-4 sm:p-5")}>
        <label className="relative block">
          <span className="sr-only">ابحث</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم، حيّ، تخصص… مثل: حلاقة أو إنجليزية" className={cn(input, "w-full ps-10")} />
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute start-3 top-3.5 h-4 w-4 text-[#1F3C88]/60" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </label>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {AREAS.map((c) => (
            <button key={c} type="button" onClick={() => setCity(c)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-bold", focus, city === c ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
              {c === "الكل" ? "كل الأحياء" : c}
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
                    <p className="text-[13px] text-[#13294B]/70">{s.kind}، {s.area}</p>
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
                    <div className="overflow-hidden rounded-2xl ring-1 ring-[#1F3C88]/10">
                      <iframe
                        title={`موقع ${s.name} على الخريطة`}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${s.coords[1] - 0.012}%2C${s.coords[0] - 0.007}%2C${s.coords[1] + 0.012}%2C${s.coords[0] + 0.007}&layer=mapnik&marker=${s.coords[0]}%2C${s.coords[1]}`}
                        className="h-44 w-full border-0 sm:h-52"
                      />
                      <p className="flex items-center justify-between gap-2 bg-white px-3 py-2 text-[12px] text-[#13294B]/70">
                        <span>{s.area}، الجزائر — موقع تقريبي</span>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${s.coords[0]},${s.coords[1]}`} target="_blank" rel="noreferrer" className="font-bold text-[#1F3C88] underline-offset-2 hover:underline">افتح في الخرائط</a>
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-bold">البرنامج الكامل</p>
                      <dl className="divide-y divide-[#1F3C88]/10 rounded-xl bg-white text-sm ring-1 ring-[#1F3C88]/10">
                        {(
                          [
                            ["المستويات / التخصصات", s.levels],
                            ["المحتوى", s.subjects],
                            ["المدة", s.length],
                            ["الدوام", s.hours],
                            ["الشهادة", s.diploma],
                            ["حقوق التسجيل", fmt(s.regFee)],
                            ["الشهرية", fmt(s.fee)],
                          ] as const
                        ).map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[110px_1fr] gap-2 px-3 py-2.5">
                            <dt className="text-[13px] text-[#13294B]/70">{k}</dt>
                            <dd className="font-semibold">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    {s.team && (
                      <div>
                        <p className="mb-2 text-sm font-bold">فريق التدريس <span className="font-normal text-[#13294B]/70">— يظهر بموافقة الأستاذ، بلا تقييم</span></p>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {s.team.map((t) => (
                            <li key={t.name} className="rounded-xl bg-white p-3 text-sm ring-1 ring-[#1F3C88]/10">
                              <b>{t.name}</b> — {t.subject}
                              <span className="block text-[12px] text-[#13294B]/70">{t.cv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm font-bold">تقييمات موثّقة ({reviews.length})</p>
                    {reviews.map((r) => (
                      <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-[#1F3C88]/10">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#13294B]/70">
                          <span className="inline-flex items-center gap-1.5">
                            <Pill tone="green">{r.student ? "متعلّم موثّق" : "وليّ موثّق"}</Pill>
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
                      ["الحي", (s: School) => s.area],
                      ["الشهادة", (s: School) => s.diploma],
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
            <li>المتعلّم الراشد (لغات، تكوين مهني) يقيّم بنفسه بنفس الشرط.</li>
            <li>لا تقييم للأساتذة بأسمائهم، وملفاتهم تظهر بموافقتهم فقط.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
