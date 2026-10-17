"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { act, ago, useWorld, type Job } from "../store";
import { Btn, Empty, NoteCard, Pill, card, focus, input, useDemo } from "../ui";
import { SCHOOLS, schoolName } from "./directory";

const KINDS: ("الكل" | Job["kind"])[] = ["الكل", "تدريس", "إدارة", "حراسة", "نظافة"];

/** Public job board: schools post, job seekers apply, the director answers. */
export function JobsView() {
  const w = useWorld();
  const { flash, now } = useDemo();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("الكل");
  const [openId, setOpenId] = useState<number | null>(null);
  const [name, setName] = useState("ليلى حمّادي");
  const [exp, setExp] = useState("4 سنوات في مدرسة خاصة");

  const list = w.jobs.filter((j) => j.open && (kind === "الكل" || j.kind === kind));
  const notes = w.notes.filter((n) => n.to === "jobs").slice(0, 3);
  const area = (id: string) => SCHOOLS.find((s) => s.id === id)?.area ?? "";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section className={cn(card, "p-4 sm:p-5")}>
        <h2 className="font-display text-2xl font-black">عروض العمل في المؤسسات التعليمية</h2>
        <p className="mt-1 text-sm text-[#13294B]/70">أساتذة، إداريون، حراس وعمال نظافة. المؤسسة تنشر العرض، وتصلها الطلبات مباشرة.</p>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-bold", focus, kind === k ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
              {k === "الكل" ? "كل الوظائف" : k}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-2.5">
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
            <li>المؤسسات المشتركة تنشر عروضها مجانًا.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
