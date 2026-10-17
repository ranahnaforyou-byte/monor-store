"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PUPILS, act, ago, useWorld, info } from "../store";
import { Avatar, Btn, Panel, Pill, RoleHead, Stat, Tabs, card, input, useDemo } from "../ui";

const CHANGES = ["ملغاة — غياب الأستاذ", "معوّضة السبت 09:00", "القاعة تغيّرت إلى ق 3"];

export function SupervisorView() {
  const w = useWorld();
  const S = info(w);
  const { flash, now } = useDemo();
  const [tab, setTab] = useState<"gate" | "absences" | "discipline" | "schedule" | "messages">("absences");
  const [pupil, setPupil] = useState(PUPILS[0]);
  const [text, setText] = useState("استعمال الهاتف أثناء الحصة");
  const [when, setWhen] = useState("الأربعاء 15:00");
  const [sid, setSid] = useState(5);
  const [change, setChange] = useState(CHANGES[0]);

  // gate vs class: who came in, who is in class, and where they disagree
  const gateRows = PUPILS.map((p) => {
    const g = w.gate.find((x) => x.pupil === p);
    const absentInClass = w.absences.some((a) => a.pupil === p && a.date === "اليوم");
    const flag = g?.in && absentInClass ? "in-not-class" : !g?.in && w.attendanceSent && !absentInClass ? "class-not-in" : null;
    return { p, g, absentInClass, flag };
  });
  const alerts = gateRows.filter((r) => r.flag).length;
  const clock = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const sent = w.absences.filter((a) => a.status === "sent");
  const open = w.absences.filter((a) => a.status === "open");

  return (
    <div className="space-y-4">
      <div className={cn(card, "p-4 sm:p-5")}>
        <RoleHead name="رشيد بلقاسم" line={`مستشار التربية — ${S.name}`} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat icon="doc" label="تبريرات للمراجعة" value={sent.length} tone="amber" />
        <Stat icon="alert" label="غياب بلا تبرير" value={open.length} tone="red" />
        <Stat icon="people" label="استدعاءات" value={w.convocations.length} />
      </div>
      <Tabs value={tab} onChange={setTab} items={[["absences", "الغيابات", sent.length], ["gate", "البوابة", alerts], ["discipline", "الانضباط والاستدعاءات"], ["schedule", "استعمال الزمن"], ["messages", "الرسائل تحت الإشراف"]]} />

      {tab === "absences" && (
        <Panel title="الغيابات والتبريرات">
          <ul className="space-y-2">
            {w.absences.map((a) => (
              <li key={a.id} className={cn("flex flex-wrap items-center gap-3 rounded-2xl p-3", a.status === "sent" ? "anim-pop bg-[#FFF8E6] ring-1 ring-[#F5A524]/50" : "bg-[#F5F8FF]")}>
                <Avatar name={a.pupil} tone="bg-[#FDECEC] text-[#B42F2A]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{a.pupil} — {a.date}، {a.session}</p>
                  <p className="text-[13px] text-[#13294B]/65">{a.note ? `التبرير: ${a.note}` : "لم يصل تبرير بعد"}</p>
                </div>
                {a.status === "sent" ? (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Btn size="sm" tone="red" className="flex-1" onClick={() => { act.decideJustification(a.id, false); flash("رُفض التبرير — أُشعر الولي"); }}>ارفض</Btn>
                    <Btn size="sm" tone="green" className="flex-1" onClick={() => { act.decideJustification(a.id, true); flash("قُبل التبرير — أُشعر الولي والمدير"); }}>اقبل التبرير</Btn>
                  </div>
                ) : (
                  <Pill tone={a.status === "justified" ? "green" : "red"}>{a.status === "justified" ? "مبرَّر" : a.status === "rejected" ? "مرفوض" : "غير مبرَّر"}</Pill>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "discipline" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="ملاحظة أو استدعاء">
            <div className="space-y-2">
              <select value={pupil} onChange={(e) => setPupil(e.target.value)} aria-label="التلميذ" className={cn(input, "w-full")}>
                {PUPILS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <input value={text} onChange={(e) => setText(e.target.value)} aria-label="الملاحظة" className={cn(input, "w-full")} />
              <Btn tone="ghost" className="w-full" onClick={() => { act.addIncident(pupil, text); flash("سُجّلت الملاحظة — أُشعر الولي والمدير"); }}>سجّل ملاحظة انضباط</Btn>
              <div className="flex gap-2 pt-2">
                <input value={when} onChange={(e) => setWhen(e.target.value)} aria-label="موعد الاستدعاء" className={cn(input, "min-w-0 flex-1")} />
                <Btn onClick={() => { act.convoke(pupil, when, text); flash("أُرسل الاستدعاء للولي"); }}>استدعِ الولي</Btn>
              </div>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="الاستدعاءات">
              <ul className="space-y-2">
                {w.convocations.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-xl bg-[#F5F8FF] p-3 text-sm">
                    <span className="flex-1"><b>{c.pupil}</b> — {c.when}<span className="block text-[12px] text-[#13294B]/70">{c.reason}</span></span>
                    <Pill tone={c.status === "confirmed" ? "green" : "amber"}>{c.status === "confirmed" ? "الولي أكّد" : "بانتظار الولي"}</Pill>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="سجل الانضباط">
              <ul className="space-y-2 text-sm">
                {w.incidents.map((i) => <li key={i.id} className="rounded-xl bg-[#F5F8FF] p-3"><b>{i.pupil}:</b> {i.text}<span className="block text-[11px] text-[#13294B]/70">{ago(i.at, now)}</span></li>)}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {tab === "gate" && (
        <Panel title={`البوابة — ${S.group}، اليوم`} aside={alerts ? <Pill tone="red">{alerts} للتحقق</Pill> : <Pill tone="green">كل شيء مطابق</Pill>}>
          <p className="mb-3 text-[13px] text-[#13294B]/70">الحارس يسجّل الدخول والخروج (بالبطاقة أو بالاسم)، والنظام يقارنه بحضور القسم. الولي يُنبَّه عند دخول ابنه وخروجه.</p>
          <ul className="space-y-2">
            {gateRows.map(({ p, g, absentInClass, flag }) => (
              <li key={p} className={cn("flex flex-wrap items-center gap-3 rounded-2xl p-3", flag === "in-not-class" ? "bg-[#FFF5F4] ring-1 ring-[#D63C37]/30" : flag ? "bg-[#FFFAF0] ring-1 ring-[#F5A524]/40" : "bg-[#F5F8FF]")}>
                <Avatar name={p} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{p}</p>
                  <p className="text-[12px] text-[#13294B]/70">
                    {g?.in ? `دخل ${g.in}` : "لم يُسجَّل دخوله"}
                    {g?.out ? ` — خرج ${g.out}` : ""}
                    {absentInClass ? " — غائب في القسم" : w.attendanceSent ? " — حاضر في القسم" : ""}
                  </p>
                  {flag && (
                    <p className={cn("mt-0.5 text-[12px] font-bold", flag === "in-not-class" ? "text-[#B42F2A]" : "text-[#8A5A0B]")}>
                      {flag === "in-not-class" ? "دخل المدرسة ولم يحضر الحصة — تحقّق فورًا" : "حاضر في القسم دون تسجيل دخول — تحقّق من البوابة"}
                    </p>
                  )}
                </div>
                <span className="flex gap-1.5">
                  {!g?.in && <Btn size="sm" tone="ghost" onClick={() => { act.gateMark(p, "in", clock()); flash(`سُجّل دخول ${p}`); }}>دخل</Btn>}
                  {g?.in && !g?.out && <Btn size="sm" tone="ghost" onClick={() => { act.gateMark(p, "out", clock()); flash(`سُجّل خروج ${p}`); }}>خرج</Btn>}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "schedule" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Panel title={`استعمال زمن ${S.group}`}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {w.sessions.map((s) => (
                <li key={s.id} className={cn("rounded-xl p-2.5 text-sm", s.change ? "bg-[#FEF3DC]" : "bg-[#F5F8FF]")}>
                  <b>{s.day} {s.time}</b> — {s.subject} <span className="text-[12px] text-[#13294B]/70">({s.room})</span>
                  {s.change && <span className="block text-[12px] font-bold text-[#8A5A0B]">{s.change}</span>}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="تعديل حصة">
            <div className="space-y-2">
              <select value={sid} onChange={(e) => setSid(Number(e.target.value))} aria-label="الحصة" className={cn(input, "w-full")}>
                {w.sessions.map((s) => <option key={s.id} value={s.id}>{s.day} {s.time} — {s.subject}</option>)}
              </select>
              <select value={change} onChange={(e) => setChange(e.target.value)} aria-label="التعديل" className={cn(input, "w-full")}>
                {CHANGES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <Btn className="w-full" onClick={() => { act.changeSession(sid, change); flash("عُدّل استعمال الزمن — أُشعر التلاميذ والأولياء والأستاذة"); }}>طبّق وأشعر الجميع</Btn>
            </div>
          </Panel>
        </div>
      )}

      {tab === "messages" && (
        <Panel title="رسائل الأولياء مع المدرسة" aside={<Pill tone="gray">اطلاع فقط</Pill>}>
          <p className="mb-3 text-[13px] text-[#13294B]/70">كل الرسائل خاصة بين وليّ والمدرسة. لا توجد مجموعات بين الأولياء، والإدارة تطّلع على كل محادثة.</p>
          <ul className="space-y-3">
            {w.threads.map((t) => (
              <li key={t.id} className="rounded-2xl bg-[#F5F8FF] p-3">
                <p className="text-sm font-bold">وليّ آدم بوعلام ↔ {t.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-[#13294B]/70">{t.msgs[t.msgs.length - 1]?.text}</p>
                <p className="mt-1 text-[11px] text-[#13294B]/70">{t.msgs.length} رسائل</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
