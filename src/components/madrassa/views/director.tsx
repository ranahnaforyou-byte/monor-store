"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CLASS, PERMS, SCHOOL, act, ago, fmt, roleLabel, useWorld } from "../store";
import { Btn, Panel, Pill, RoleHead, Stars, Stat, Tabs, NoteCard, card, input, useDemo } from "../ui";

/** Demo baseline for the whole school (fictional); the live demo class adds to it. */
const BASE = { pupils: 286, collected: 4_590_000, expected: 5_148_000, absentToday: 9 };
const CLASSES = [
  ["1 متوسط — أ", 13.4], ["1 متوسط — ب", 12.1], ["2 متوسط — أ", 12.8], ["3 متوسط — أ", 11.6], ["3 متوسط — ب", 12.3],
] as const;

export function DirectorView() {
  const w = useWorld();
  const { flash, now } = useDemo();
  const [tab, setTab] = useState<"overview" | "approvals" | "staff" | "reviews">("overview");
  const [ann, setAnn] = useState("العطلة تبدأ الخميس بعد آخر حصة. استئناف الدراسة الأحد 3 نوفمبر.");
  const [reply, setReply] = useState<Record<number, string>>({});

  const confirmed = w.fees.filter((f) => f.status === "confirmed").reduce((a, b) => a + b.amount, 0);
  const late = w.fees.filter((f) => f.status === "late");
  const pending = w.approvals.filter((a) => a.status === "pending");
  const today = w.absences.filter((a) => a.date === "اليوم");
  const enrolled = w.reqs.filter((r) => r.stage === 4).length;
  const marks = Object.values(w.exam.marks).map(Number).filter((n) => !Number.isNaN(n));
  const myAvg = w.exam.published && marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : null;
  const collected = BASE.collected + confirmed;
  const pct = Math.round((collected / BASE.expected) * 100);
  const feed = w.notes.filter((n) => n.to === "director");
  const myReviews = w.reviews.filter((r) => r.school === "najah");

  return (
    <div className="space-y-4">
      <div className={cn(card, "flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5")}>
        <RoleHead name="نادية حمدي" line={`مديرة ${SCHOOL.name} — ${SCHOOL.area}`} tone="bg-[#1F3C88] text-white" />
        <Pill tone="gray">أكتوبر</Pill>
      </div>
      <Tabs value={tab} onChange={setTab} items={[["overview", "نظرة عامة"], ["approvals", "الموافقات", pending.length], ["staff", "الموظفون والصلاحيات"], ["reviews", "التقييمات"]]} />

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon="people" label="التلاميذ المسجّلون" value={BASE.pupils + enrolled} sub={`${w.reqs.filter((r) => r.stage < 4).length} طلبات قيد المعالجة`} />
            <Stat icon="money" label="المحصّل هذا الشهر" value={fmt(collected)} sub={`${pct}٪ من المتوقع`} tone="green" />
            <Stat icon="clock" label="متأخرات" value={late.length} sub={fmt(late.reduce((a, b) => a + b.amount, 0)) + " في هذا القسم"} tone="red" />
            <Stat icon="alert" label="غيابات اليوم" value={BASE.absentToday + today.length} sub={`${w.absences.filter((a) => a.status === "sent").length} تبرير بانتظار المستشار`} tone="amber" />
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#E9EEFB]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="نسبة التحصيل">
            <div className="h-full rounded-full bg-[#0C8A64] transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <Panel title="ما يحدث الآن في المدرسة">
              <ul className="space-y-2">
                {feed.slice(0, 7).map((n) => (
                  <NoteCard key={n.id} tone={n.tone} text={n.text} when={ago(n.at, now)} fresh={typeof n.at === "number" && now - n.at < 120000} />
                ))}
              </ul>
            </Panel>
            <div className="space-y-4">
              <Panel title="نتائج الأقسام — معدل الرياضيات">
                <ul className="space-y-2.5">
                  {[...CLASSES, [CLASS, myAvg] as const].map(([c, v]) => (
                    <li key={c} className="grid grid-cols-[96px_1fr_44px] items-center gap-2 text-sm">
                      <span className={cn("truncate", c === CLASS && "font-bold")}>{c}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-[#E9EEFB]">
                        {v != null && <span className={cn("block h-full rounded-full", c === CLASS ? "bg-[#F5A524]" : "bg-[#1F3C88]")} style={{ width: `${(v / 20) * 100}%` }} />}
                      </span>
                      <span className="num text-end font-bold">{v != null ? v.toFixed(1) : "—"}</span>
                    </li>
                  ))}
                </ul>
                {myAvg == null && <p className="mt-2 text-[12px] text-[#13294B]/55">{CLASS}: يظهر المعدل عندما تنشر الأستاذة النقاط.</p>}
              </Panel>
              <Panel title="إعلان لكل الأولياء">
                <form onSubmit={(e) => { e.preventDefault(); if (!ann.trim()) return; act.announce(ann.trim(), "المديرة"); flash("نُشر الإعلان — وصل للأولياء والتلاميذ والأساتذة"); }}>
                  <textarea value={ann} onChange={(e) => setAnn(e.target.value)} rows={3} aria-label="نص الإعلان" className={cn(input, "h-auto w-full py-2")} />
                  <Btn type="submit" className="mt-2 w-full">انشر الإعلان</Btn>
                </form>
                <p className="mt-2 text-[12px] text-[#13294B]/55">إعلان في اتجاه واحد: لا ردود ولا تعليقات بين الأولياء.</p>
              </Panel>
            </div>
          </div>
        </>
      )}

      {tab === "approvals" && (
        <Panel title="طلبات تنتظر قرارك">
          <ul className="space-y-2">
            {w.approvals.map((a) => (
              <li key={a.id} className={cn("flex flex-wrap items-center gap-3 rounded-2xl p-3", a.status === "pending" ? "bg-[#FFF8E6] ring-1 ring-[#F5A524]/40" : "bg-[#F5F8FF]")}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="text-[13px] text-[#13294B]/65">{a.detail}</p>
                  <p className="text-[12px] text-[#13294B]/50">من: {roleLabel(a.from)}</p>
                </div>
                {a.status === "pending" ? (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Btn size="sm" tone="red" className="flex-1" onClick={() => { act.decide(a.id, false); flash("رُفض الطلب — أُشعر صاحبه"); }}>ارفض</Btn>
                    <Btn size="sm" tone="green" className="flex-1" onClick={() => { act.decide(a.id, true); flash("تمت الموافقة — أُشعر صاحب الطلب"); }}>وافق</Btn>
                  </div>
                ) : (
                  <Pill tone={a.status === "approved" ? "green" : "red"}>{a.status === "approved" ? "موافَق" : "مرفوض"}</Pill>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "staff" && (
        <Panel title="من يرى ماذا">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-[12px] text-[#13294B]/60">
                  <th className="py-2 text-start font-semibold">الموظف</th>
                  {PERMS.map((p) => <th key={p} className="px-1 py-2 text-center font-semibold">{p}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F3C88]/10">
                {w.staff.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5"><b>{s.name}</b><span className="block text-[12px] text-[#13294B]/55">{s.job}</span></td>
                    {PERMS.map((p) => (
                      <td key={p} className="px-1 py-2.5 text-center">
                        <input type="checkbox" checked={!!s.perms[p]} onChange={() => act.togglePerm(s.id, p)} aria-label={`${s.name}: ${p}`} className="h-5 w-5 accent-[#1F3C88]" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] text-[#13294B]/55">الأساتذة موظفون داخل المؤسسة: لا حساب عام لهم، ويرون أقسامهم فقط.</p>
        </Panel>
      )}

      {tab === "reviews" && (
        <Panel title="تقييمات المدرسة في الدليل" aside={<Stars n={myReviews.reduce((a, b) => a + b.stars, 0) / Math.max(myReviews.length, 1)} />}>
          <ul className="space-y-2">
            {myReviews.map((r) => (
              <li key={r.id} className="rounded-2xl bg-[#F5F8FF] p-3">
                <div className="flex items-center justify-between text-[12px] text-[#13294B]/60"><span>{r.by}</span><Stars n={r.stars} /></div>
                <p className="mt-1 text-sm">{r.text}</p>
                {r.reply ? (
                  <p className="mt-2 rounded-lg bg-[#E9EEFB] px-3 py-2 text-[13px] text-[#1F3C88]"><b>ردّكم:</b> {r.reply}</p>
                ) : (
                  <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = reply[r.id]?.trim(); if (!t) return; act.reply(r.id, t); flash("نُشر ردّكم علنًا تحت التقييم"); }}>
                    <input value={reply[r.id] ?? ""} onChange={(e) => setReply((x) => ({ ...x, [r.id]: e.target.value }))} placeholder="ردّ علني…" aria-label="الرد" className={cn(input, "h-10 min-w-0 flex-1")} />
                    <Btn type="submit" size="sm" className="h-10">ردّ</Btn>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[#13294B]/55">يمكنكم الرد علنًا، ولا يمكن حذف تقييم موثّق.</p>
        </Panel>
      )}
    </div>
  );
}
