"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ME_CHILD, REQ_STAGES, SCHOOL, act, ago, fmt, useWorld } from "../store";
import { Btn, Empty, Panel, Pill, RoleHead, Tabs, NoteCard, card, focus, input, useDemo } from "../ui";
import { schoolName } from "./directory";

const KIDS = [
  { id: "adam", name: "آدم", school: SCHOOL.name, cls: "4 متوسط — أ", live: true },
  { id: "salma", name: "سلمى", school: "مدرسة المستقبل", cls: "3 ابتدائي — ب", live: false },
  { id: "rayan", name: "ريان", school: "مركز آفاق للغات", cls: "إنجليزية B1 — مسائي", live: false },
];

export const REPORT = [
  ["اللغة العربية", "14.5"], ["الرياضيات", null], ["اللغة الفرنسية", "12"], ["الإنجليزية", "15"], ["الفيزياء", "13"], ["العلوم الطبيعية", "16"], ["التاريخ والجغرافيا", "14"],
] as const;

export function ParentView() {
  const w = useWorld();
  const { flash, now } = useDemo();
  const [kid, setKid] = useState("adam");
  const [tab, setTab] = useState<"today" | "grades" | "fees" | "messages" | "school">("today");
  const [justify, setJustify] = useState("موعد طبي — الشهادة الطبية مرفقة");
  const [method, setMethod] = useState("بريدي موب");
  const [file, setFile] = useState<string | null>(null);
  const [thread, setThread] = useState(1);
  const [msg, setMsg] = useState("");
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");

  const myNotes = w.notes.filter((n) => n.to === "parent");
  const absences = w.absences.filter((a) => a.pupil === ME_CHILD);
  const fees = w.fees.filter((f) => f.pupil === ME_CHILD);
  const myReqs = w.reqs.filter((r) => r.mine);
  const convs = w.convocations.filter((c) => c.pupil === ME_CHILD);
  const openAbs = absences.filter((a) => a.status === "open").length;
  const dueFees = fees.filter((f) => f.status === "due" || f.status === "late").length;
  const k = KIDS.find((x) => x.id === kid)!;
  const th = w.threads.find((t) => t.id === thread)!;
  const math = w.exam.published ? w.exam.marks[ME_CHILD] : null;

  return (
    <div className="space-y-4">
      <div className={cn(card, "p-4 sm:p-5")}>
        <RoleHead name="كريم بوعلام" line="حساب واحد — 3 أبناء في 3 مؤسسات" tone="bg-[#E7F6EF] text-[#0A7554]" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {KIDS.map((c) => (
            <button key={c.id} type="button" onClick={() => setKid(c.id)} className={cn("relative rounded-2xl border p-3 text-start", focus, kid === c.id ? "border-[#1F3C88] bg-[#F5F8FF]" : "border-[#1F3C88]/10")}>
              <p className="font-black">{c.name}</p>
              <p className="line-clamp-1 text-[11px] text-[#13294B]/60">{c.school}</p>
              {c.live && openAbs + dueFees > 0 && <span className="num absolute -top-1.5 -start-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D63C37] px-1 text-[11px] font-bold text-white">{openAbs + dueFees}</span>}
            </button>
          ))}
        </div>
      </div>

      {!k.live ? (
        <Panel title={`${k.name} — ${k.school}`}>
          <p className="text-sm text-[#13294B]/70">{k.cls}</p>
          <p className="mt-3 rounded-xl bg-[#F5F8FF] p-3 text-sm">
            كل مؤسسة تنشر لأبنائك في نفس الحساب: غيابات، نقاط، مستحقات ورسائل. في هذا العرض، الروابط الحية مفعّلة مع {SCHOOL.name} (آدم).
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-[#E7F6EF] p-3"><p className="text-[#0A7554]">مستحقات أكتوبر</p><p className="font-bold">مؤكدة</p></div>
            <div className="rounded-xl bg-[#E9EEFB] p-3"><p className="text-[#1F3C88]">الغيابات</p><p className="font-bold">لا شيء هذا الشهر</p></div>
          </div>
        </Panel>
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              ["today", "اليوم", openAbs + convs.filter((c) => c.status === "sent").length],
              ["grades", "النقاط والواجبات"],
              ["fees", "المستحقات", dueFees],
              ["messages", "الرسائل"],
              ["school", "التسجيل والتقييم"],
            ]}
          />

          {tab === "today" && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <Panel title="آخر ما وصلك">
                <ul className="space-y-2">
                  {myNotes.slice(0, 8).map((n) => (
                    <NoteCard key={n.id} tone={n.tone} text={n.text} when={ago(n.at, now)} fresh={typeof n.at === "number" && now - n.at < 120000} />
                  ))}
                </ul>
              </Panel>
              <div className="space-y-4">
                <Panel title="غيابات آدم">
                  {absences.length === 0 ? (
                    <Empty>لا غياب. إذا سجّل الأستاذ غيابًا ستصلك رسالة هنا فورًا.</Empty>
                  ) : (
                    <ul className="space-y-2">
                      {absences.map((a) => (
                        <li key={a.id} className="rounded-xl bg-[#FDECEC]/60 p-3">
                          <p className="text-sm font-bold">{a.date} — {a.session}</p>
                          {a.status === "open" ? (
                            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); act.justify(a.id, justify); flash("أُرسل التبرير إلى المستشار التربوي"); }}>
                              <input value={justify} onChange={(e) => setJustify(e.target.value)} aria-label="سبب الغياب" className={cn(input, "min-w-0 flex-1")} />
                              <Btn type="submit">أرسل تبريرًا</Btn>
                            </form>
                          ) : (
                            <p className="mt-1"><Pill tone={a.status === "justified" ? "green" : a.status === "rejected" ? "red" : "amber"}>{a.status === "sent" ? "بانتظار المستشار" : a.status === "justified" ? "مبرَّر" : "تبرير مرفوض"}</Pill></p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
                {convs.length > 0 && (
                  <Panel title="استدعاءات">
                    {convs.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-xl bg-[#FDECEC]/60 p-3">
                        <div className="flex-1"><p className="text-sm font-bold">{c.when}</p><p className="text-[13px] text-[#13294B]/65">{c.reason}</p></div>
                        {c.status === "sent" ? <Btn size="sm" onClick={() => { act.confirmConvocation(c.id); flash("أُكّد حضورك"); }}>أؤكّد الحضور</Btn> : <Pill tone="green">مؤكَّد</Pill>}
                      </div>
                    ))}
                  </Panel>
                )}
                <Panel title="إعلانات المدرسة">
                  <ul className="space-y-2 text-sm">
                    {w.announcements.slice(0, 3).map((a) => <li key={a.id} className="rounded-xl bg-[#E9EEFB] p-3"><b>{a.from}:</b> {a.text}</li>)}
                  </ul>
                </Panel>
              </div>
            </div>
          )}

          {tab === "grades" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="كشف النقاط — الفصل الأول" aside={<Pill tone="gray">مؤقت</Pill>}>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#1F3C88]/10">
                    {REPORT.map(([s, g]) => {
                      const v = g ?? math;
                      return (
                        <tr key={s}>
                          <td className="py-2.5">{s}</td>
                          <td className={cn("num py-2.5 text-end font-bold", !v && "text-[#13294B]/40", s === "الرياضيات" && math && "text-[#0A7554]")}>{v ? `${v} / 20` : "لم تُنشر"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Panel>
              <Panel title="الواجبات">
                <ul className="space-y-2">
                  {w.homework.map((h) => (
                    <li key={h.id} className="rounded-xl bg-[#F5F8FF] p-3 text-sm">
                      <div className="flex items-center justify-between gap-2"><b>{h.subject}</b><span className="text-[12px] text-[#13294B]/60">قبل {h.due}</span></div>
                      <p className="mt-1">{h.text}</p>
                      {h.done && <Pill tone="green" className="mt-2">أنجزه آدم</Pill>}
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}

          {tab === "fees" && (
            <Panel title="مستحقات آدم">
              <ul className="space-y-2">
                {fees.map((f) => (
                  <li key={f.id} className="rounded-2xl bg-[#F5F8FF] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{f.month}</p>
                        <p className="num font-display text-2xl font-black">{fmt(f.amount)}</p>
                      </div>
                      <Pill tone={f.status === "confirmed" ? "green" : f.status === "receipt" ? "amber" : "red"}>
                        {f.status === "confirmed" ? "مؤكدة" : f.status === "receipt" ? "بانتظار المحاسبة" : "مستحقة"}
                      </Pill>
                    </div>
                    <ol className="mt-3 flex items-center gap-1.5 text-[12px] font-bold" aria-label="مراحل الدفع">
                      {["مستحقة", "وصل مُرسل", "مؤكدة من المحاسبة"].map((s, i) => {
                        const at = f.status === "confirmed" ? 2 : f.status === "receipt" ? 1 : 0;
                        return (
                          <li key={s} className="flex items-center gap-1.5">
                            <span className={cn("rounded-full px-2.5 py-1", i < at ? "bg-[#E7F6EF] text-[#0A7554]" : i === at ? (at === 2 ? "bg-[#0C8A64] text-white" : "bg-[#FEEFD0] text-[#8A5A0B]") : "bg-white text-[#13294B]/40")}>{s}</span>
                            {i < 2 && <span aria-hidden className="text-[#13294B]/30">←</span>}
                          </li>
                        );
                      })}
                    </ol>
                    {(f.status === "due" || f.status === "late") && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-bold">بأي طريقة دفعت؟</p>
                        <div role="radiogroup" aria-label="طريقة الدفع" className="grid grid-cols-3 gap-2">
                          {["بريدي موب", "CCP", "نقدًا"].map((m) => (
                            <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={cn("flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold", focus, method === m ? "border-[#1F3C88] bg-white text-[#1F3C88] ring-1 ring-[#1F3C88]" : "border-[#1F3C88]/12 bg-white/60 text-[#13294B]/65")}>
                              <span className={cn("h-3.5 w-3.5 rounded-full border-2", method === m ? "border-[#1F3C88] bg-[#1F3C88] shadow-[inset_0_0_0_2px_#fff]" : "border-[#13294B]/30")} />
                              {m}
                            </button>
                          ))}
                        </div>
                        <div className="rounded-2xl border-2 border-dashed border-[#1F3C88]/20 bg-white p-4 text-center">
                          {file ? (
                            <p className="flex items-center justify-center gap-2 text-sm font-bold">
                              <span className="rounded-md bg-[#FDE3E1] px-1.5 py-0.5 text-[11px] text-[#B42F2A]">{file.split(".").pop()?.toUpperCase()}</span>
                              <span className="truncate">{file}</span>
                              <button type="button" onClick={() => setFile(null)} aria-label="أزل الملف" className={cn("rounded-full px-2 text-[#13294B]/50", focus)}>✕</button>
                            </p>
                          ) : (
                            <>
                              <p className="text-sm font-bold">صورة الوصل أو ملف PDF</p>
                              <div className="mt-2 flex flex-wrap justify-center gap-2">
                                <label className={cn("inline-flex h-10 cursor-pointer items-center rounded-xl bg-[#1F3C88] px-4 text-sm font-bold text-white focus-within:ring-2 focus-within:ring-[#F5A524]")}>
                                  اختر ملفًا
                                  <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
                                </label>
                                <Btn tone="ghost" className="h-10" onClick={() => setFile("وصل_أكتوبر.jpg")}>صورة تجريبية</Btn>
                              </div>
                              <p className="mt-2 text-[11px] text-[#13294B]/50">في العرض التجريبي لا يُرفع الملف لأي خادم.</p>
                            </>
                          )}
                        </div>
                        <Btn disabled={!file} onClick={() => { act.uploadReceipt(f.id, method); setFile(null); flash("أُرسل الوصل — بانتظار تأكيد المحاسبة"); }} className="w-full">أرسل الوصل للمحاسبة</Btn>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[#13294B]/60">الدفع يتم خارج المنصة (بريدي موب، CCP أو نقدًا)؛ المنصة تنقل الوصل للمحاسبة وتحفظ التأكيد.</p>
            </Panel>
          )}

          {tab === "messages" && (
            <div className={cn(card, "grid overflow-hidden md:grid-cols-[240px_1fr]")}>
              <ul className="flex gap-2 overflow-x-auto border-b border-[#1F3C88]/10 p-3 md:block md:space-y-2 md:border-b-0 md:border-e">
                {w.threads.map((t) => (
                  <li key={t.id} className="shrink-0">
                    <button type="button" onClick={() => setThread(t.id)} className={cn("w-full rounded-xl px-3 py-2.5 text-start text-sm font-bold", focus, thread === t.id ? "bg-[#1F3C88] text-white" : "bg-[#F5F8FF] text-[#13294B]")}>{t.title}</button>
                  </li>
                ))}
              </ul>
              <div className="flex min-h-[340px] flex-col p-3 sm:p-4">
                <p className="mb-2 text-[12px] text-[#13294B]/55">رسائل خاصة بينك وبين المدرسة فقط — تطّلع عليها الإدارة. لا يرى الأولياء الآخرون شيئًا.</p>
                <ul className="flex-1 space-y-2">
                  {th.msgs.map((m, i) => (
                    <li key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm", m.by === "parent" ? "ms-auto bg-[#1F3C88] text-white" : "bg-[#F5F8FF]")}>
                      {m.text}
                      <span className={cn("mt-1 block text-[11px]", m.by === "parent" ? "text-white/60" : "text-[#13294B]/45")}>{ago(m.at, now)}</span>
                    </li>
                  ))}
                </ul>
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!msg.trim()) return; act.sendMessage(thread, "parent", msg.trim()); setMsg(""); flash(th.with === "teacher" ? "وصلت رسالتك للأستاذة" : "وصلت رسالتك للإدارة"); }}>
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="اكتب رسالتك…" aria-label="الرسالة" className={cn(input, "min-w-0 flex-1 rounded-full px-4")} />
                  <Btn type="submit" className="rounded-full">أرسل</Btn>
                </form>
              </div>
            </div>
          )}

          {tab === "school" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="طلبات التسجيل">
                {myReqs.length === 0 ? (
                  <Empty>لا طلبات. اطلب تسجيلًا من «الدليل العام» وتابع مراحله هنا.</Empty>
                ) : (
                  myReqs.map((r) => (
                    <div key={r.id} className="mt-1 mb-4">
                      <p className="text-sm font-bold">{r.child} — {schoolName(r.school)}</p>
                      <ol className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px] font-bold sm:text-[11px]">
                        {REQ_STAGES.map((st, i) => (
                          <li key={st} className={cn("rounded-lg px-0.5 py-1.5", i <= r.stage ? "bg-[#0C8A64] text-white" : "bg-[#F5F8FF] text-[#13294B]/45")}>{st}</li>
                        ))}
                      </ol>
                      {r.waiting && <p className="mt-1.5 text-[12px] text-[#8A5A0B]">بانتظار موافقة المدير</p>}
                      {r.slot && r.stage === 2 && <p className="mt-1.5 text-[12px] text-[#1F3C88]">موعد الاختبار: {r.slot}</p>}
                    </div>
                  ))
                )}
              </Panel>
              <Panel title={`قيّم ${SCHOOL.name}`} aside={<Pill tone="green">ابنك مسجّل</Pill>}>
                <form onSubmit={(e) => { e.preventDefault(); if (!review.trim()) return; act.review(stars, review.trim()); setReview(""); flash("نُشر تقييمك في الدليل — المدرسة تردّ ولا تحذف"); }}>
                  <div className="flex gap-1" role="radiogroup" aria-label="عدد النجوم">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} نجوم`} onClick={() => setStars(n)} className={cn("h-10 w-10 rounded-xl text-xl", focus, n <= stars ? "text-[#E89A14]" : "text-[#13294B]/20")}>★</button>
                    ))}
                  </div>
                  <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3} placeholder="رأيك في المؤسسة (لا تذكر أسماء الأساتذة)" aria-label="التقييم" className={cn(input, "mt-2 h-auto w-full py-2")} />
                  <Btn type="submit" className="mt-2 w-full">انشر التقييم</Btn>
                </form>
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
