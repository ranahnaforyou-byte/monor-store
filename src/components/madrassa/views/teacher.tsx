"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CLASS, PUPILS, SCHOOL, act, ago, useWorld } from "../store";
import { Avatar, Btn, Panel, Pill, RoleHead, Tabs, card, focus, input, useDemo } from "../ui";

export function TeacherView() {
  const w = useWorld();
  const { flash, now } = useDemo();
  const [tab, setTab] = useState<"attendance" | "grades" | "homework" | "messages">("attendance");
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [hw, setHw] = useState("تمارين الصفحة 51: المعادلات (1 إلى 5)");
  const [due, setDue] = useState("الأربعاء");
  const [reply, setReply] = useState("");

  const t = w.threads.find((x) => x.with === "teacher")!;
  const marks = Object.values(w.exam.marks).map(Number).filter((n) => !Number.isNaN(n));
  const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
  const changes = w.sessions.filter((s) => s.change && s.subject === "الرياضيات");
  const lastFromParent = t.msgs[t.msgs.length - 1]?.by === "parent";

  return (
    <div className="space-y-4">
      <div className={cn(card, "flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5")}>
        <RoleHead name="أ. سميرة مداني" line={`أستاذة الرياضيات — ${SCHOOL.name}`} tone="bg-[#FEF3DC] text-[#8A5A0B]" />
        <div className="flex flex-wrap gap-2">
          <Pill tone="blue">{CLASS}</Pill>
          <Pill tone="gray">3 متوسط — ب</Pill>
        </div>
      </div>
      {changes.map((s) => <p key={s.id} className="rounded-2xl bg-[#FEF3DC] p-3 text-sm font-semibold text-[#8A5A0B]">تعديل من المستشار: {s.day} {s.time} — {s.change}</p>)}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          ["attendance", "الحضور"],
          ["grades", "النقاط"],
          ["homework", "الواجبات"],
          ["messages", "رسائل الأولياء", lastFromParent ? 1 : 0],
        ]}
      />

      {tab === "attendance" && (
        <Panel title="الحضور — الأحد 08:00" aside={w.attendanceSent ? <Pill tone="green">أُرسل</Pill> : <Pill tone="amber">لم يُرسل</Pill>}>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PUPILS.map((n) => (
              <li key={n} className={cn("flex items-center gap-3 rounded-2xl border p-2", absent[n] ? "border-[#D63C37]/30 bg-[#FFF5F4]" : "border-[#1F3C88]/10")}>
                <Avatar name={n} tone={absent[n] ? "bg-[#FDE3E1] text-[#B42F2A]" : undefined} />
                <span className="min-w-0 flex-1 text-sm font-semibold">{n}</span>
                <span role="radiogroup" aria-label={`حضور ${n}`} className="flex gap-1">
                  {([false, true] as const).map((isAbsent) => {
                    const on = !!absent[n] === isAbsent;
                    return (
                      <button
                        key={String(isAbsent)}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={w.attendanceSent}
                        onClick={() => setAbsent((a) => ({ ...a, [n]: isAbsent }))}
                        className={cn(
                          "inline-flex h-9 items-center gap-1 rounded-xl px-3 text-[13px] font-bold disabled:cursor-default",
                          focus,
                          on ? (isAbsent ? "border border-[#D63C37]/50 bg-white text-[#B42F2A]" : "border border-[#0C8A64]/40 bg-[#E7F6EF] text-[#0A7554]") : "bg-[#F1F4FA] text-[#13294B]/70",
                        )}
                      >
                        {on && <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d={isAbsent ? "M6 6l12 12M18 6 6 18" : "M20 6 9 17l-5-5"} /></svg>}
                        {isAbsent ? "غائب" : "حاضر"}
                      </button>
                    );
                  })}
                </span>
              </li>
            ))}
          </ul>
          {!w.attendanceSent && <p className="mt-3 text-[13px] text-[#13294B]/70">اجعل «آدم بوعلام» غائبًا ثم أرسل: يُنبَّه وليّه والمستشار في نفس اللحظة.</p>}
          <Btn
            className="mt-3 w-full"
            disabled={w.attendanceSent}
            onClick={() => {
              const list = PUPILS.filter((p) => absent[p]);
              act.sendAttendance(list);
              flash(list.length ? `أُرسل الحضور — ${list.length} غياب، أُشعر الأولياء المعنيون` : "أُرسل الحضور — الكل حاضر");
            }}
          >
            {w.attendanceSent ? "أُرسل الحضور" : "أرسل الحضور"}
          </Btn>
        </Panel>
      )}

      {tab === "grades" && (
        <Panel title={w.exam.title} aside={<span className="num text-sm font-bold text-[#13294B]/70">المعدل {avg.toFixed(2)}</span>}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {PUPILS.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-xl bg-[#F5F8FF] p-2.5">
                <Avatar name={p} />
                <label htmlFor={`m-${p}`} className="flex-1 text-sm font-semibold">{p}</label>
                <input
                  id={`m-${p}`}
                  inputMode="decimal"
                  disabled={w.exam.published}
                  value={w.exam.marks[p] ?? ""}
                  onChange={(e) => act.setMark(p, e.target.value.replace(",", "."))}
                  className={cn(input, "num h-10 w-20 text-center font-bold disabled:bg-transparent")}
                />
              </li>
            ))}
          </ul>
          <Btn tone="green" className="mt-3 w-full" disabled={w.exam.published} onClick={() => { act.publishExam(); flash("نُشرت النقاط — كل وليّ يرى نقطة ابنه فقط"); }}>
            {w.exam.published ? "النقاط منشورة" : "انشر النقاط للأولياء والتلاميذ"}
          </Btn>
        </Panel>
      )}

      {tab === "homework" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title={`واجب جديد — ${CLASS}`}>
            <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!hw.trim()) return; act.addHomework("الرياضيات", hw.trim(), due); flash("نُشر الواجب للتلاميذ وأوليائهم"); }}>
              <textarea value={hw} onChange={(e) => setHw(e.target.value)} rows={3} aria-label="نص الواجب" className={cn(input, "h-auto w-full py-2")} />
              <div className="flex gap-2">
                <select value={due} onChange={(e) => setDue(e.target.value)} aria-label="آخر أجل" className={cn(input, "flex-1")}>
                  {["الإثنين", "الثلاثاء", "الأربعاء", "الخميس"].map((d) => <option key={d}>{d}</option>)}
                </select>
                <Btn type="submit" tone="amber" className="flex-1">انشر الواجب</Btn>
              </div>
            </form>
            <p className="mt-2 text-[12px] text-[#13294B]/70">اتجاه واحد: من الأستاذة إلى التلاميذ وأوليائهم، بلا تعليقات بين الأولياء.</p>
          </Panel>
          <Panel title="الواجبات المنشورة">
            <ul className="space-y-2 text-sm">
              {w.homework.filter((h) => h.subject === "الرياضيات").map((h) => <li key={h.id} className="rounded-xl bg-[#F5F8FF] p-3">{h.text}<span className="block text-[12px] text-[#13294B]/70">قبل {h.due}</span></li>)}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "messages" && (
        <Panel title="وليّ آدم بوعلام" aside={<Pill tone="gray">تطّلع عليها الإدارة</Pill>}>
          <ul className="space-y-2">
            {t.msgs.map((m, i) => (
              <li key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm", m.by === "teacher" ? "ms-auto bg-[#1F3C88] text-white" : "bg-[#F5F8FF]")}>
                {m.text}
                <span className={cn("mt-1 block text-[11px]", m.by === "teacher" ? "text-white/60" : "text-[#13294B]/55")}>{ago(m.at, now)}</span>
              </li>
            ))}
          </ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; act.sendMessage(t.id, "teacher", reply.trim()); setReply(""); flash("وصل ردّك للولي"); }}>
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="ردّ على الولي…" aria-label="الرد" className={cn(input, "min-w-0 flex-1 rounded-full px-4")} />
            <Btn type="submit" className="rounded-full">أرسل</Btn>
          </form>
        </Panel>
      )}
    </div>
  );
}
