"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { act, ago, info, useWorld, type Job, type Talent } from "../store";
import { Btn, Empty, NoteCard, Pill, Tabs, card, focus, input, useDemo } from "../ui";
import { schoolsFor } from "./directory";

const KINDS: ("الكل" | Job["kind"])[] = ["الكل", "تدريس", "إدارة", "حراسة", "نظافة"];

/** Public job board: schools post offers and job seekers apply; job seekers also publish their own service profile. */
export function JobsView() {
  const w = useWorld();
  const { flash, now } = useDemo();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("الكل");
  const [openId, setOpenId] = useState<number | null>(null);
  const [name, setName] = useState("ليلى حمّادي");
  const [exp, setExp] = useState("4 سنوات في مدرسة خاصة");
  const [tab, setTab] = useState<"offers" | "talents">("offers");
  const [form, setForm] = useState(false);
  const [t, setT] = useState<Omit<Talent, "id" | "at" | "mine" | "invited">>({ name: "ليلى حمّادي", title: "أستاذة علوم طبيعية", kind: "تدريس", levels: "متوسط وثانوي", exp: "4 سنوات في مدرسة خاصة", diploma: "ماستر بيولوجيا", areas: "بن عكنون، حيدرة", mode: "دوام كامل" });
  const talents = w.talents.filter((x) => kind === "الكل" || x.kind === kind);

  const list = w.jobs.filter((j) => j.open && (kind === "الكل" || j.kind === kind));
  const notes = w.notes.filter((n) => n.to === "jobs").slice(0, 3);
  const all = schoolsFor(info(w));
  const area = (id: string) => all.find((s) => s.id === id)?.area ?? "";
  const schoolName = (id: string) => all.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section className={cn(card, "p-4 sm:p-5")}>
        <h2 className="font-display text-2xl font-black">العمل في المؤسسات التعليمية</h2>
        <p className="mt-1 text-sm text-[#13294B]/70">المؤسسات تنشر عروضها، والأساتذة والمكوّنون والعمال ينشرون ملفات خدماتهم. أساتذة، إداريون، حراس وعمال نظافة.</p>
        <div className="mt-3">
          <Tabs value={tab} onChange={setTab} items={[["offers", "عروض المؤسسات", list.length], ["talents", "الباحثون عن عمل", w.talents.length]]} />
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-bold", focus, kind === k ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
              {k === "الكل" ? "كل الأصناف" : k}
            </button>
          ))}
        </div>
        {tab === "talents" && (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#FEF3DC] p-3">
              <p className="text-sm"><b>أنت أستاذ أو مكوّن أو عامل؟</b> انشر ملفك مجانًا، فتجدك المؤسسات وتطلب مقابلتك.</p>
              <Btn size="sm" tone={form ? "ghost" : "amber"} onClick={() => setForm(!form)}>{form ? "إغلاق" : "أنشئ ملفك"}</Btn>
            </div>
            {form && (
              <form
                className="anim-pop mt-3 grid gap-2 rounded-2xl border border-[#1F3C88]/15 p-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!t.name.trim() || !t.title.trim()) return;
                  act.postTalent(t);
                  setForm(false);
                  flash("نُشر ملفك — افتح «المدير» ثم «التوظيف» لترى وصوله");
                }}
              >
                <input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} aria-label="الاسم" placeholder="الاسم الكامل" className={input} />
                <input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} aria-label="التخصص" placeholder="التخصص (مثال: أستاذ رياضيات)" className={input} />
                <select value={t.kind} onChange={(e) => setT({ ...t, kind: e.target.value as Job["kind"] })} aria-label="الصنف" className={input}>
                  {(["تدريس", "إدارة", "حراسة", "نظافة"] as const).map((k) => <option key={k}>{k}</option>)}
                </select>
                <input value={t.levels} onChange={(e) => setT({ ...t, levels: e.target.value })} aria-label="المستويات" placeholder="المستويات أو المجال" className={input} />
                <input value={t.exp} onChange={(e) => setT({ ...t, exp: e.target.value })} aria-label="الخبرة" placeholder="الخبرة" className={input} />
                <input value={t.diploma} onChange={(e) => setT({ ...t, diploma: e.target.value })} aria-label="الشهادة" placeholder="الشهادة" className={input} />
                <input value={t.areas} onChange={(e) => setT({ ...t, areas: e.target.value })} aria-label="الأحياء" placeholder="الأحياء المناسبة" className={input} />
                <input value={t.mode} onChange={(e) => setT({ ...t, mode: e.target.value })} aria-label="نوع العمل" placeholder="دوام كامل، جزئي، دروس دعم…" className={input} />
                <p className="text-[12px] text-[#13294B]/70 sm:col-span-2">أوافق على نشر ملفي للمؤسسات. رقم هاتفي لا يظهر، والمؤسسة تتصل بي عبر المنصة.</p>
                <Btn type="submit" tone="amber" className="sm:col-span-2">انشر ملفي</Btn>
              </form>
            )}
            <ul className="mt-3 space-y-2.5">
              {talents.length === 0 && <li><Empty>لا ملفات في هذا الصنف الآن.</Empty></li>}
              {talents.map((x) => (
                <li key={x.id} className={cn("rounded-2xl border p-4", x.mine ? "border-[#F5A524]/60 bg-[#FFFBF2]" : "border-[#1F3C88]/10")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold leading-snug">{x.name} — {x.title}</p>
                      <p className="text-[13px] text-[#13294B]/70">{x.levels}</p>
                    </div>
                    <Pill tone={x.kind === "تدريس" ? "blue" : x.kind === "إدارة" ? "green" : "amber"}>{x.kind}</Pill>
                  </div>
                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-[13px] sm:grid-cols-2">
                    <div><dt className="inline text-[#13294B]/70">الخبرة: </dt><dd className="inline">{x.exp}</dd></div>
                    <div><dt className="inline text-[#13294B]/70">الشهادة: </dt><dd className="inline">{x.diploma}</dd></div>
                    <div><dt className="inline text-[#13294B]/70">الأحياء: </dt><dd className="inline">{x.areas}</dd></div>
                    <div><dt className="inline text-[#13294B]/70">العمل: </dt><dd className="inline">{x.mode}</dd></div>
                  </dl>
                  <p className="mt-2 text-[12px] text-[#13294B]/70">{x.mine ? "ملفك" : "نُشر"} {ago(x.at, now)}{x.invited ? " · طلبت مؤسسة مقابلته" : ""}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className={cn("mt-4 space-y-2.5", tab !== "offers" && "hidden")}>
          {list.length === 0 && <li><Empty>لا عروض في هذا الصنف الآن.</Empty></li>}
          {list.map((j) => {
            const applied = w.applications.filter((a) => a.jobId === j.id).length;
            const isOpen = openId === j.id;
            return (
              <li key={j.id} className={cn("rounded-2xl border p-4", isOpen ? "border-[#1F3C88]/40 bg-[#F8FAFF]" : "border-[#1F3C88]/10")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold leading-snug">{j.title}</p>
                    <p className="text-[13px] text-[#13294B]/70">{schoolName(j.school)}، {area(j.school)}</p>
                    <p className="mt-1 text-[13px]">{j.hours} — {j.note}</p>
                  </div>
                  <Pill tone={j.kind === "تدريس" ? "blue" : j.kind === "إدارة" ? "green" : "amber"}>{j.kind}</Pill>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-[#13294B]/70">{applied ? `${applied} طلب` : "كن أول من يقدّم"}</span>
                  <Btn size="sm" tone={isOpen ? "ghost" : "blue"} onClick={() => setOpenId(isOpen ? null : j.id)}>{isOpen ? "إغلاق" : "قدّم طلبك"}</Btn>
                </div>
                {isOpen && (
                  <form
                    className="anim-pop mt-3 grid gap-2 rounded-xl bg-[#FEF3DC] p-3 sm:grid-cols-[1fr_1fr_auto]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!name.trim()) return;
                      act.applyJob(j.id, name.trim(), exp.trim());
                      setOpenId(null);
                      flash(j.school === "najah" ? "أُرسل طلبك للمدرسة — افتح «المدير» لترى وصوله" : "أُرسل طلبك للمؤسسة");
                    }}
                  >
                    <input value={name} onChange={(e) => setName(e.target.value)} aria-label="الاسم" placeholder="الاسم الكامل" className={input} />
                    <input value={exp} onChange={(e) => setExp(e.target.value)} aria-label="الخبرة" placeholder="الخبرة باختصار" className={input} />
                    <Btn type="submit" tone="amber">أرسل الطلب</Btn>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-4 lg:sticky lg:top-36 lg:h-fit">
        {notes.length > 0 && (
          <section className={cn(card, "p-4 sm:p-5")}>
            <h3 className="mb-3 font-display text-lg font-black">ردود المؤسسات</h3>
            <ul className="space-y-2">
              {notes.map((n) => <NoteCard key={n.id} tone={n.tone} text={n.text} when={ago(n.at, now)} />)}
            </ul>
          </section>
        )}
        <section className="rounded-[20px] bg-[#13294B] p-5 text-white">
          <h3 className="font-display text-lg font-black">قواعد الفضاء</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/85">
            <li>العروض من مؤسسات موثّقة فقط.</li>
            <li>رقم الهاتف لا يظهر علنًا: المؤسسة هي من تتصل بعد قبول الطلب.</li>
            <li>المؤسسات المشتركة تنشر عروضها مجانًا، وتبحث في ملفات الباحثين.</li>
            <li>نشر ملف الخدمات مجاني للأستاذ والمكوّن والعامل، وبموافقته فقط.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
