"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FILES, REQ_STAGES, SCHOOL, act, useWorld } from "../store";
import { Btn, Panel, Pill, RoleHead, Tabs, card, input, useDemo } from "../ui";

const COLS = [
  { bg: "bg-[#EEF2FC]", dot: "bg-white text-[#1F3C88]", mark: "+", hint: "لم يُعالج بعد" },
  { bg: "bg-[#FFF7E8]", dot: "bg-white text-[#8A5A0B]", mark: "☎", hint: "تم الاتصال بالولي" },
  { bg: "bg-[#EEF2FC]", dot: "bg-white text-[#1F3C88]", mark: "✎", hint: "موعد الاختبار محدد" },
  { bg: "bg-[#EEF9F4]", dot: "bg-white text-[#0A7554]", mark: "✓", hint: "وافق المدير — الملف قيد الإكمال" },
  { bg: "bg-[#E3F5EC]", dot: "bg-[#0C8A64] text-white", mark: "★", hint: "مسجّل ومستحقاته عند المحاسب" },
];

export function ReceptionView() {
  const w = useWorld();
  const { flash } = useDemo();
  const [tab, setTab] = useState<"pipeline" | "appts" | "messages">("pipeline");
  const [who, setWho] = useState("كريم بوعلام");
  const [when, setWhen] = useState("الإثنين 10:00");
  const [why, setWhy] = useState("تسليم ملف التسجيل");
  const [reply, setReply] = useState("");
  const reqs = w.reqs.filter((r) => r.school === "najah");
  const t = w.threads.find((x) => x.with === "admin")!;
  const fresh = reqs.filter((r) => r.stage === 0).length;

  return (
    <div className="space-y-4">
      <div className={cn(card, "p-4 sm:p-5")}>
        <RoleHead name="أمال سعدي" line={`الاستقبال والتسجيلات — ${SCHOOL.name}`} />
      </div>
      <Tabs value={tab} onChange={setTab} items={[["pipeline", "طلبات التسجيل", fresh], ["appts", "مواعيد الأولياء"], ["messages", "رسائل الأولياء", t.msgs[t.msgs.length - 1]?.by === "parent" ? 1 : 0]]} />

      {tab === "pipeline" && (
        <>
          <p className="text-[13px] text-[#13294B]/60">حرّك الطلب مرحلة بمرحلة. القبول يحتاج موافقة المدير، والتسجيل يضيف المستحقات عند المحاسبة تلقائيًا.</p>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
            {REQ_STAGES.map((st, si) => {
              const col = reqs.filter((r) => r.stage === si);
              return (
                <section key={st} className={cn("w-[78%] shrink-0 snap-start rounded-2xl sm:w-[46%] lg:w-auto", COLS[si].bg)}>
                  <div className="px-3 pb-2 pt-3">
                    <h3 className="flex items-center justify-between text-sm font-black">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[12px]", COLS[si].dot)}>{COLS[si].mark}</span>
                        {st}
                      </span>
                      <span className="num rounded-full bg-white px-2 text-xs">{col.length}</span>
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#13294B]/55">{COLS[si].hint}</p>
                  </div>
                  <ul className="space-y-2 p-2 pt-0">
                    {col.map((r) => {
                      const done = FILES.filter((f) => r.files[f]).length;
                      return (
                        <li key={r.id} className={cn("rounded-xl bg-white p-3 ring-1 ring-[#1F3C88]/10", si === 0 && "anim-pop ring-[#F5A524]")}>
                          <p className="text-sm font-bold">{r.child}</p>
                          <p className="text-[12px] text-[#13294B]/60">{r.level} — وليّ: {r.parent}</p>
                          {r.slot && si === 2 && <p className="mt-1 text-[12px] font-bold text-[#1F3C88]">اختبار: {r.slot}</p>}
                          <details className="mt-2">
                            <summary className="cursor-pointer text-[12px] font-bold text-[#1F3C88]">الملف {done}/{FILES.length}</summary>
                            <ul className="mt-1.5 space-y-1">
                              {FILES.map((f) => (
                                <li key={f}>
                                  <label className="flex items-center gap-2 text-[12px]">
                                    <input type="checkbox" checked={!!r.files[f]} onChange={() => act.toggleFile(r.id, f)} className="h-3.5 w-3.5 accent-[#0C8A64]" />
                                    {f}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </details>
                          {si < REQ_STAGES.length - 1 &&
                            (r.waiting ? (
                              <Pill tone="amber" className="mt-2">بانتظار موافقة المدير</Pill>
                            ) : (
                              <Btn
                                size="sm"
                                tone={si === 2 ? "amber" : si === 3 ? "green" : "ghost"}
                                className="mt-2 w-full"
                                disabled={si === 3 && done < FILES.length}
                                onClick={() => {
                                  act.advance(r.id);
                                  flash(si === 2 ? "أُرسل طلب القبول للمدير" : si === 3 ? `سُجّل ${r.child} — أُضيفت مستحقاته للمحاسبة` : `انتقل الطلب إلى «${REQ_STAGES[si + 1]}»`);
                                }}
                              >
                                {si === 2 ? "اطلب موافقة المدير" : si === 3 ? (done < FILES.length ? "أكمل الملف أولًا" : "سجّل التلميذ") : `انقل إلى «${REQ_STAGES[si + 1]}»`}
                              </Btn>
                            ))}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}

      {tab === "appts" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="المواعيد القادمة">
            <ul className="space-y-2">
              {w.appts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl bg-[#F5F8FF] p-3 text-sm">
                  <span className="num w-28 shrink-0 font-bold text-[#1F3C88]">{a.when}</span>
                  <span className="flex-1"><b>{a.who}</b><span className="block text-[12px] text-[#13294B]/60">{a.why}</span></span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="موعد جديد">
            <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); act.addAppt(who, when, why); flash("سُجّل الموعد وأُشعر الولي"); }}>
              <input value={who} onChange={(e) => setWho(e.target.value)} aria-label="الولي" className={cn(input, "w-full")} />
              <input value={when} onChange={(e) => setWhen(e.target.value)} aria-label="الموعد" className={cn(input, "w-full")} />
              <input value={why} onChange={(e) => setWhy(e.target.value)} aria-label="السبب" className={cn(input, "w-full")} />
              <Btn type="submit" className="w-full">حدّد الموعد</Btn>
            </form>
          </Panel>
        </div>
      )}

      {tab === "messages" && (
        <Panel title="وليّ آدم بوعلام" aside={<Pill tone="gray">رسالة خاصة</Pill>}>
          <ul className="space-y-2">
            {t.msgs.map((m, i) => (
              <li key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm", m.by === "admin" ? "ms-auto bg-[#1F3C88] text-white" : "bg-[#F5F8FF]")}>{m.text}</li>
            ))}
          </ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; act.sendMessage(t.id, "admin", reply.trim()); setReply(""); flash("وصل الرد للولي"); }}>
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="ردّ باسم الإدارة…" aria-label="الرد" className={cn(input, "min-w-0 flex-1 rounded-full px-4")} />
            <Btn type="submit" className="rounded-full">أرسل</Btn>
          </form>
        </Panel>
      )}
    </div>
  );
}
