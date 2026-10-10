"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SERVICES = [
  { key: "plumb", label: "سباكة", icon: "M12 2v6M8 8h8v4a4 4 0 0 1-8 0zM12 16v6" },
  { key: "elec", label: "كهرباء", icon: "M13 2 4 14h7l-1 8 9-12h-7z" },
  { key: "ac", label: "تكييف", icon: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9" },
  { key: "paint", label: "دهان", icon: "M4 4h13v5H4zM17 6h3v6h-8v3M12 15v6" },
  { key: "wood", label: "نجارة", icon: "M3 21l7-7M14.5 3.5l6 6-9 9-6-6z" },
  { key: "clean", label: "تنظيف", icon: "M5 21h14M7 21V11h10v10M9 11V5a3 3 0 0 1 6 0v6" },
] as const;

type ServiceKey = (typeof SERVICES)[number]["key"];

const ARTISANS: { name: string; trade: ServiceKey; wilaya: string; km: string; jobs: number; helpers: string[] }[] = [
  { name: "أحمد حداد", trade: "plumb", wilaya: "الجزائر", km: "2.3", jobs: 128, helpers: ["رضا", "سمير"] },
  { name: "كمال بوزيد", trade: "plumb", wilaya: "الجزائر", km: "4.1", jobs: 76, helpers: ["أنيس"] },
  { name: "نبيل عيساوي", trade: "elec", wilaya: "الجزائر", km: "1.8", jobs: 203, helpers: ["وليد", "إلياس"] },
  { name: "فريد شريف", trade: "elec", wilaya: "البليدة", km: "6.0", jobs: 54, helpers: ["هشام"] },
  { name: "مراد قاسمي", trade: "ac", wilaya: "الجزائر", km: "3.2", jobs: 97, helpers: ["سفيان"] },
  { name: "يوسف بلعيد", trade: "paint", wilaya: "الجزائر", km: "5.4", jobs: 61, helpers: ["أمين", "زكريا"] },
  { name: "عبد القادر منصوري", trade: "wood", wilaya: "بومرداس", km: "7.9", jobs: 142, helpers: ["حمزة"] },
  { name: "شركة نقاء", trade: "clean", wilaya: "الجزائر", km: "2.9", jobs: 310, helpers: ["فريق 1", "فريق 2"] },
];

type Stage = "idle" | "sent" | "accepted" | "onway" | "done";
type Msg = { from: "client" | "artisan" | "system"; text: string };

const STAGE_LABEL: Record<Exclude<Stage, "idle">, string> = {
  sent: "أُرسل الطلب للحرفي",
  accepted: "قبل الحرفي الطلب",
  onway: "الحرفي في الطريق",
  done: "أُنجز العمل",
};

function initials(n: string) {
  const p = n.split(" ");
  return (p[0]?.[0] ?? "") + (p[1]?.[0] ?? "");
}

export function CraftsDemo() {
  const [service, setService] = useState<ServiceKey>("plumb");
  const [picked, setPicked] = useState<string | null>(null);
  const [problem, setProblem] = useState("تسرّب ماء تحت حوض المطبخ");
  const [when, setWhen] = useState("اليوم 15:00");
  const [stage, setStage] = useState<Stage>("idle");
  const [helper, setHelper] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);

  const list = ARTISANS.filter((a) => a.trade === service);
  const artisan = ARTISANS.find((a) => a.name === picked) ?? list[0];
  const serviceLabel = SERVICES.find((s) => s.key === service)!.label;

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs]);

  const push = (m: Msg) => setMsgs((x) => [...x, m]);

  function send() {
    setStage("sent");
    setHelper(null);
    setMsgs([{ from: "system", text: `طلب جديد: ${serviceLabel} · ${problem} · ${when}` }]);
  }
  function accept() {
    setStage("accepted");
    push({ from: "system", text: `${artisan.name.split(" ")[0]} قبل الطلب` });
    window.setTimeout(() => push({ from: "artisan", text: "السلام عليكم، استلمت طلبك. هل يمكن أن ترسل صورة للمشكلة؟" }), 700);
  }
  function decline() {
    setStage("idle");
    setMsgs([]);
  }
  function onWay() {
    setStage("onway");
    push({ from: "system", text: `${helper ?? artisan.name.split(" ")[0]} في الطريق إليك · الوصول خلال 30 دقيقة` });
  }
  function finish() {
    setStage("done");
    push({ from: "system", text: "أُنجز العمل · الدفع نقدًا عند الانتهاء" });
  }
  function sendMsg(from: "client" | "artisan") {
    const t = draft.trim();
    if (!t) return;
    push({ from, text: t });
    setDraft("");
    if (from === "client" && stage !== "idle") {
      window.setTimeout(() => push({ from: "artisan", text: "حسنًا، فهمت. سأحضر الأدوات اللازمة." }), 900);
    }
  }

  const steps: Exclude<Stage, "idle">[] = ["sent", "accepted", "onway", "done"];
  const reached = stage === "idle" ? -1 : steps.indexOf(stage as Exclude<Stage, "idle">);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      {/* Customer side */}
      <section className="hn-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black">ماذا تحتاج اليوم؟</h2>
          <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-[#0f7a52]">الزبون</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SERVICES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setService(s.key);
                setPicked(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-sm font-bold transition-colors",
                service === s.key ? "border-mint-strong bg-mint-soft text-[#0f7a52]" : "border-line bg-paper text-ink-soft",
              )}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={s.icon} />
              </svg>
              {s.label}
            </button>
          ))}
        </div>

        <h3 className="mb-2 mt-5 text-sm font-bold text-ink-soft">حرفيون قريبون منك</h3>
        <ul className="space-y-2">
          {list.map((a) => {
            const on = (picked ?? list[0]?.name) === a.name;
            return (
              <li key={a.name}>
                <button
                  type="button"
                  onClick={() => setPicked(a.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors",
                    on ? "border-mint-strong bg-mint-soft/60" : "border-line bg-paper",
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint-soft font-bold text-[#0f7a52]">{initials(a.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{a.name}</span>
                    <span className="block text-xs text-muted">
                      {serviceLabel} · {a.wilaya} · <span className="num">{a.jobs}</span> عمل منجز
                    </span>
                  </span>
                  <span className="text-end">
                    <span className="num block text-sm font-bold">{a.km} كم</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f7a52]">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" /> متوفر الآن
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">
            وصف المشكلة
            <input value={problem} onChange={(e) => setProblem(e.target.value)} className="h-11 rounded-xl border border-line-strong bg-surface px-3 font-normal outline-none focus:border-brand" />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            الموعد
            <select value={when} onChange={(e) => setWhen(e.target.value)} className="h-11 rounded-xl border border-line-strong bg-surface px-3 font-normal outline-none focus:border-brand">
              {["الآن", "اليوم 15:00", "اليوم 18:00", "غدًا صباحًا"].map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </label>
        </div>

        {stage === "idle" ? (
          <button type="button" onClick={send} className="mt-4 h-12 w-full rounded-2xl bg-brand text-base font-black text-white active:scale-[0.99]">
            اطلب {artisan?.name.split(" ")[0]}
          </button>
        ) : (
          <div className="mt-4 rounded-2xl bg-surface p-4">
            <p className="mb-3 text-sm font-bold">متابعة طلبك</p>
            <ol className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
              {steps.map((s, i) => (
                <li key={s} className={cn("rounded-xl px-1 py-2", i <= reached ? "bg-mint-strong text-white" : "bg-paper text-muted")}>
                  {STAGE_LABEL[s]}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Chat */}
        {msgs.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line">
            <p className="border-b border-line px-4 py-2.5 text-sm font-bold">محادثة مع {artisan.name}</p>
            <div className="max-h-56 space-y-2 overflow-y-auto p-3">
              {msgs.map((m, i) =>
                m.from === "system" ? (
                  <p key={i} className="rounded-xl bg-mint-soft px-3 py-2 text-center text-xs font-semibold text-[#0f7a52]">{m.text}</p>
                ) : (
                  <p
                    key={i}
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      m.from === "client" ? "ms-auto rounded-ee-md bg-brand text-white" : "rounded-es-md bg-surface",
                    )}
                  >
                    {m.text}
                  </p>
                ),
              )}
              <div ref={chatEnd} />
            </div>
            <div className="flex gap-2 border-t border-line p-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg("client")}
                placeholder="اكتب رسالة للحرفي…"
                className="h-10 flex-1 rounded-full border border-line-strong bg-surface px-4 text-sm outline-none focus:border-brand"
              />
              <button type="button" onClick={() => sendMsg("client")} className="h-10 rounded-full bg-brand px-4 text-sm font-bold text-white">
                إرسال
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Workshop phone */}
      <section>
        <div className="mx-auto w-full max-w-[360px] rounded-[36px] bg-[#1b2421] p-2.5 shadow-[var(--shadow-lg)]">
          <div className="min-h-[560px] overflow-hidden rounded-[30px] bg-surface">
            <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-3">
              <span className="font-display text-base font-black text-brand">ورشة {artisan.name.split(" ")[0]}</span>
              <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-bold text-[#0f7a52]">تطبيق الحرفي</span>
            </div>
            <div className="space-y-3 p-3">
              {stage === "idle" ? (
                <div className="rounded-2xl bg-paper p-6 text-center">
                  <p className="font-bold">لا طلبات جديدة</p>
                  <p className="mt-1 text-xs text-muted">أرسل طلبًا من الجهة الأخرى وشاهده يصل هنا.</p>
                </div>
              ) : (
                <div className={cn("rounded-2xl border bg-paper", stage === "sent" ? "anim-pop anim-ring border-coral/60" : "border-line")}>
                  {stage === "sent" && <div className="rounded-t-2xl bg-coral-strong px-4 py-1.5 text-xs font-bold text-white">طلب عمل جديد · الآن</div>}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{serviceLabel} · {problem}</p>
                      <span className="num text-xs text-muted">{artisan.km} كم</span>
                    </div>
                    <p className="text-sm text-muted">باب الزوار · {when}</p>

                    {stage === "sent" && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" onClick={accept} className="h-11 rounded-xl bg-brand text-sm font-bold text-white">قبول</button>
                        <button type="button" onClick={decline} className="h-11 rounded-xl border border-line-strong text-sm font-bold">رفض</button>
                      </div>
                    )}

                    {stage === "accepted" && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-bold text-ink-soft">أرسل مع:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[artisan.name.split(" ")[0], ...artisan.helpers].map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setHelper(h)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-bold",
                                (helper ?? artisan.name.split(" ")[0]) === h ? "border-brand bg-brand-soft text-brand" : "border-line-strong text-ink-soft",
                              )}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={onWay} className="h-11 w-full rounded-xl bg-saffron text-sm font-bold text-ink">في الطريق</button>
                      </div>
                    )}
                    {stage === "onway" && (
                      <button type="button" onClick={finish} className="mt-3 h-11 w-full rounded-xl bg-mint-strong text-sm font-bold text-white">تم إنجاز العمل</button>
                    )}
                    {stage === "done" && (
                      <p className="mt-3 rounded-xl bg-mint-soft py-2 text-center text-sm font-bold text-[#0f7a52]">أُنجز · تم الدفع نقدًا</p>
                    )}
                  </div>
                </div>
              )}

              {stage !== "idle" && stage !== "sent" && (
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMsg("artisan")}
                    placeholder="رد على الزبون…"
                    className="h-10 flex-1 rounded-full border border-line-strong bg-paper px-4 text-sm outline-none focus:border-brand"
                  />
                  <button type="button" onClick={() => sendMsg("artisan")} className="h-10 rounded-full bg-brand px-4 text-sm font-bold text-white">
                    رد
                  </button>
                </div>
              )}

              <div className="rounded-2xl bg-paper p-3">
                <p className="mb-2 text-xs font-bold text-ink-soft">فريق الورشة</p>
                {[artisan.name, ...artisan.helpers].map((h, i) => (
                  <div key={h} className="flex items-center gap-2 py-1 text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-soft text-[11px] font-bold text-[#0f7a52]">{initials(h)}</span>
                    <span className="flex-1 font-semibold">{h}</span>
                    <span className="text-xs text-muted">{i === 0 ? "معلّم الورشة" : "مساعد"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {stage === "done" && (
          <button type="button" onClick={decline} className="mx-auto mt-3 block text-sm font-bold text-brand underline">
            إعادة العرض
          </button>
        )}
      </section>
    </div>
  );
}
