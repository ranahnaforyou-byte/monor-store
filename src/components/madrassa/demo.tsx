"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo world — Algiers + Oran (fictional institutions, demo data)
// ---------------------------------------------------------------------------

type Kind = "مدرسة خاصة" | "مركز لغات" | "مركز دعم" | "تكوين مهني";

type School = {
  id: string;
  name: string;
  kind: Kind;
  city: "الجزائر العاصمة" | "وهران";
  area: string;
  levels: string;
  fee: number; // DZD per month
  rating: number;
  reviews: { by: string; text: string; stars: number; reply?: string }[];
};

const SCHOOLS: School[] = [
  {
    id: "najah", name: "مدرسة النجاح الخاصة", kind: "مدرسة خاصة", city: "الجزائر العاصمة", area: "حيدرة",
    levels: "تحضيري · ابتدائي · متوسط", fee: 18000, rating: 4.6,
    reviews: [
      { by: "وليّ تلميذ في السنة 4", stars: 5, text: "متابعة يومية ممتازة، والأستاذة ترد على الجروب بسرعة.", reply: "شكرًا لثقتكم، هذا هدفنا." },
      { by: "وليّة تلميذة في السنة 2", stars: 4, text: "مستوى جيد، لكن النقل المدرسي يتأخر أحيانًا.", reply: "أضفنا حافلة ثانية لحيّكم ابتداءً من نوفمبر." },
    ],
  },
  {
    id: "mostaqbal", name: "مدرسة المستقبل", kind: "مدرسة خاصة", city: "الجزائر العاصمة", area: "بئر مراد رايس",
    levels: "ابتدائي · متوسط · ثانوي", fee: 22000, rating: 4.4,
    reviews: [{ by: "وليّ تلميذ في المتوسط", stars: 4, text: "اهتمام جيد بالرياضيات والعلوم." }],
  },
  {
    id: "yasmine", name: "مدرسة الياسمين", kind: "مدرسة خاصة", city: "الجزائر العاصمة", area: "الشراقة",
    levels: "تحضيري · ابتدائي", fee: 15000, rating: 4.2,
    reviews: [{ by: "وليّة طفل في التحضيري", stars: 4, text: "محيط هادئ ونشاطات جميلة للأطفال." }],
  },
  {
    id: "ofoq", name: "مركز أفق للغات", kind: "مركز لغات", city: "الجزائر العاصمة", area: "باب الزوار",
    levels: "إنجليزية · فرنسية · ألمانية · IELTS", fee: 6000, rating: 4.8,
    reviews: [{ by: "تلميذ راشد", stars: 5, text: "اختبار مستوى دقيق وأفواج صغيرة.", reply: "سعداء بتقدّمك!" }],
  },
  {
    id: "tafawok", name: "مركز التفوق للدعم", kind: "مركز دعم", city: "وهران", area: "بئر الجير",
    levels: "دعم: رياضيات · فيزياء · بكالوريا", fee: 4500, rating: 4.5,
    reviews: [{ by: "وليّة تلميذ في البكالوريا", stars: 5, text: "تحسّن واضح في الرياضيات خلال شهرين." }],
  },
  {
    id: "itqane", name: "معهد الإتقان للتكوين", kind: "تكوين مهني", city: "وهران", area: "السانية",
    levels: "إعلام آلي · محاسبة · تصميم", fee: 9000, rating: 4.3,
    reviews: [{ by: "متربص", stars: 4, text: "تكوين تطبيقي وتربص في مؤسسات." }],
  },
  {
    id: "nour-oran", name: "مدرسة النور الخاصة", kind: "مدرسة خاصة", city: "وهران", area: "وسط المدينة",
    levels: "ابتدائي · متوسط", fee: 17000, rating: 4.1,
    reviews: [{ by: "وليّ تلميذ في الابتدائي", stars: 4, text: "إدارة متعاونة ومعلمون أكفاء." }],
  },
];

const byId = (id: string) => SCHOOLS.find((s) => s.id === id)!;

type Child = { id: string; name: string; schoolId: string; cls: string };
const CHILDREN: Child[] = [
  { id: "adam", name: "آدم", schoolId: "najah", cls: "السنة 4 ابتدائي — أ" },
  { id: "salma", name: "سلمى", schoolId: "mostaqbal", cls: "السنة 2 متوسط — ب" },
  { id: "rayan", name: "ريان", schoolId: "ofoq", cls: "إنجليزية B1 — مسائي" },
];

const CLASS_4A = ["آدم بوعلام", "إيناس شريف", "يونس قادري", "مريم عيساوي", "رامي حداد", "لينا مزيان"];

type EventType = "absence" | "grade" | "fee" | "announce" | "homework" | "request";
type Ev = { id: number; childId: string; type: EventType; text: string; at: string };
type Fee = { childId: string; month: string; amount: number; status: "due" | "pending" | "confirmed" };
type Req = { id: number; schoolId: string; child: string; level: string; stage: number };
type Absence = { id: number; childId: string; date: string; status: "new" | "sent" | "accepted"; note?: string };
type Msg = { id: number; from: "teacher" | "parent" | "system" | "school"; name: string; text: string; hidden?: boolean };

const REQ_STAGES = ["جديد", "اتصال", "اختبار المستوى", "مقبول", "مسجّل"];
const VIEWS = [
  { key: "directory", label: "الدليل", who: "عام" },
  { key: "parent", label: "الولي", who: "كريم بوعلام" },
  { key: "school", label: "المؤسسة", who: "مدرسة النجاح" },
  { key: "teacher", label: "الأستاذ", who: "أ. سميرة" },
  { key: "student", label: "التلميذ", who: "ريان" },
] as const;
type View = (typeof VIEWS)[number]["key"];

const fmt = (n: number) => `${n.toLocaleString("fr-DZ").replace(/ |\s/g, " ")} دج`;
let seq = 100;
const nid = () => ++seq;

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#B7791F]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="m12 2 3 6.6 7 .7-5.3 4.7 1.6 7-6.3-3.8L5.7 21l1.6-7L2 9.3l7-.7z" />
      </svg>
      {n.toFixed(1)}
    </span>
  );
}

function Avatar({ name, tone = "bg-[#E9EEFB] text-[#1F3C88]" }: { name: string; tone?: string }) {
  const p = name.replace(/^أ\. /, "").split(" ");
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", tone)}>
      {(p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")}
    </span>
  );
}

const card = "rounded-[22px] border border-[#1F3C88]/10 bg-white";

// ---------------------------------------------------------------------------

export function MadrassaDemo({ initialView = "directory" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [seen, setSeen] = useState<Record<View, number>>({ directory: 0, parent: 0, school: 0, teacher: 0, student: 0 });

  // shared world state
  const [events, setEvents] = useState<Ev[]>([
    { id: 1, childId: "adam", type: "announce", text: "اجتماع الأولياء يوم الخميس 16:00", at: "أمس" },
    { id: 2, childId: "salma", type: "grade", text: "فرض الرياضيات: 15.5 / 20", at: "أمس" },
    { id: 3, childId: "rayan", type: "homework", text: "تحضير عرض قصير بالإنجليزية للحصة القادمة", at: "منذ يومين" },
    { id: 4, childId: "adam", type: "fee", text: "مستحقات أكتوبر مستحقة", at: "منذ 3 أيام" },
  ]);
  const [fees, setFees] = useState<Fee[]>([
    { childId: "adam", month: "أكتوبر", amount: 18000, status: "due" },
    { childId: "salma", month: "أكتوبر", amount: 22000, status: "confirmed" },
    { childId: "rayan", month: "أكتوبر", amount: 6000, status: "due" },
  ]);
  const [otherPending, setOtherPending] = useState([
    { id: 1, parent: "وليّ يونس قادري", amount: 18000, done: false },
    { id: 2, parent: "وليّة لينا مزيان", amount: 18000, done: false },
  ]);
  const [reqs, setReqs] = useState<Req[]>([
    { id: 11, schoolId: "najah", child: "أنس بن علي", level: "السنة 1 ابتدائي", stage: 1 },
    { id: 12, schoolId: "najah", child: "هبة سعيدي", level: "السنة 3 ابتدائي", stage: 2 },
    { id: 13, schoolId: "najah", child: "زكريا عمراني", level: "تحضيري", stage: 3 },
  ]);
  const [myReqIds, setMyReqIds] = useState<number[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [chat, setChat] = useState<Msg[]>([
    { id: 1, from: "teacher", name: "أ. سميرة", text: "صباح الخير، غدًا خرجة إلى حديقة التجارب. يُرجى إحضار قبعة وماء." },
    { id: 2, from: "parent", name: "وليّة إيناس", text: "شكرًا أستاذة، في أي ساعة العودة؟" },
    { id: 3, from: "teacher", name: "أ. سميرة", text: "العودة على الساعة 15:30 إن شاء الله." },
  ]);

  // teacher-side local
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [attendanceSent, setAttendanceSent] = useState(false);
  const [grade, setGrade] = useState("16");
  const [hw, setHw] = useState("تمارين الصفحة 42 (1 إلى 4)");

  // parent-side local
  const [child, setChild] = useState("adam");
  const [justify, setJustify] = useState("موعد طبي — الشهادة مع آدم غدًا");
  const [parentMsg, setParentMsg] = useState("");

  // directory local
  const [city, setCity] = useState<"الكل" | School["city"]>("الكل");
  const [kind, setKind] = useState<"الكل" | Kind>("الكل");
  const [openSchool, setOpenSchool] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [reqChild, setReqChild] = useState("نور بوعلام");
  const [reqLevel, setReqLevel] = useState("السنة 1 ابتدائي");
  const [toast, setToast] = useState<string | null>(null);

  // school-side local
  const [schoolTab, setSchoolTab] = useState<"requests" | "fees" | "absences" | "group" | "team">("requests");

  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 3200);
  };
  const addEvent = (e: Omit<Ev, "id" | "at">) => setEvents((x) => [{ ...e, id: nid(), at: "الآن" }, ...x]);
  const addMsg = (m: Omit<Msg, "id">) => setChat((x) => [...x, { ...m, id: nid() }]);

  // "badges": new things waiting for each role since it was last opened
  const counters = useMemo(
    () => ({
      directory: 0,
      parent: events.filter((e) => e.at === "الآن").length,
      school:
        reqs.filter((r) => r.schoolId === "najah" && r.stage === 0).length +
        fees.filter((f) => f.status === "pending" && CHILDREN.find((c) => c.id === f.childId)?.schoolId === "najah").length +
        absences.filter((a) => a.status === "sent").length,
      teacher: chat.filter((m) => m.from === "parent").length,
      student: events.filter((e) => e.childId === "rayan" && e.at === "الآن").length,
    }),
    [events, reqs, fees, absences, chat],
  );

  function go(v: View) {
    setView(v);
    setSeen((s) => ({ ...s, [v]: counters[v] }));
  }

  // ---------------------------------------------------------------- actions
  function sendRegistration(s: School) {
    const r: Req = { id: nid(), schoolId: s.id, child: reqChild, level: reqLevel, stage: 0 };
    setReqs((x) => [r, ...x]);
    setMyReqIds((x) => [r.id, ...x]);
    addEvent({ childId: "adam", type: "request", text: `طلب تسجيل ${reqChild} في ${s.name} أُرسل للاستقبال` });
    flash(`أُرسل طلب التسجيل إلى ${s.name} — تابعه من حساب الولي`);
  }
  function advanceReq(id: number) {
    setReqs((x) => x.map((r) => (r.id === id && r.stage < REQ_STAGES.length - 1 ? { ...r, stage: r.stage + 1 } : r)));
    const r = reqs.find((q) => q.id === id);
    if (r && myReqIds.includes(id)) {
      addEvent({ childId: "adam", type: "request", text: `طلب تسجيل ${r.child}: ${REQ_STAGES[Math.min(r.stage + 1, REQ_STAGES.length - 1)]}` });
    }
  }
  function uploadReceipt(childId: string) {
    setFees((x) => x.map((f) => (f.childId === childId ? { ...f, status: "pending" } : f)));
    flash("رُفع الوصل — بانتظار تأكيد المحاسبة");
  }
  function confirmFee(childId: string) {
    setFees((x) => x.map((f) => (f.childId === childId ? { ...f, status: "confirmed" } : f)));
    addEvent({ childId, type: "fee", text: "أكّدت المحاسبة استلام مستحقات أكتوبر" });
  }
  function sendAttendance() {
    setAttendanceSent(true);
    if (absent["آدم بوعلام"]) {
      setAbsences((x) => [{ id: nid(), childId: "adam", date: "اليوم", status: "new" }, ...x]);
      addEvent({ childId: "adam", type: "absence", text: "غياب آدم اليوم — الحصة الأولى" });
    }
    const n = Object.values(absent).filter(Boolean).length;
    addMsg({ from: "system", name: "النظام", text: `سُجّل الحضور: ${CLASS_4A.length - n} حاضر · ${n} غائب` });
    flash("أُرسل الحضور — الأولياء المعنيون أُشعروا فورًا");
  }
  function sendJustification(id: number) {
    setAbsences((x) => x.map((a) => (a.id === id ? { ...a, status: "sent", note: justify } : a)));
    flash("أُرسل التبرير إلى الإدارة");
  }
  function acceptJustification(id: number) {
    setAbsences((x) => x.map((a) => (a.id === id ? { ...a, status: "accepted" } : a)));
    addEvent({ childId: "adam", type: "absence", text: "قبلت الإدارة تبرير غياب آدم" });
    addMsg({ from: "system", name: "النظام", text: "غياب مبرَّر: آدم بوعلام" });
  }
  function postGrade() {
    addEvent({ childId: "adam", type: "grade", text: `فرض الرياضيات: ${grade} / 20` });
    flash("أُرسلت النقطة إلى وليّ آدم");
  }
  function postHomework() {
    addMsg({ from: "system", name: "واجب جديد", text: hw });
    addEvent({ childId: "adam", type: "homework", text: hw });
    flash("نُشر الواجب في جروب القسم");
  }

  const childObj = CHILDREN.find((c) => c.id === child)!;
  const childSchool = byId(childObj.schoolId);
  const childFee = fees.find((f) => f.childId === child)!;
  const childEvents = events.filter((e) => e.childId === child);
  const myReqs = reqs.filter((r) => myReqIds.includes(r.id));
  const visible = SCHOOLS.filter((s) => (city === "الكل" || s.city === city) && (kind === "الكل" || s.kind === kind));

  const evIcon: Record<EventType, { c: string; d: string }> = {
    absence: { c: "bg-[#FDECEC] text-[#D63C37]", d: "M12 8v5M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" },
    grade: { c: "bg-[#E7F6EF] text-[#0C8A64]", d: "M4 19h16M7 15l3-3 3 3 5-6" },
    fee: { c: "bg-[#FEF3DC] text-[#B7791F]", d: "M3 7h18v10H3zM7 12h.01M17 12h.01M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
    announce: { c: "bg-[#E9EEFB] text-[#1F3C88]", d: "M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6" },
    homework: { c: "bg-[#E9EEFB] text-[#1F3C88]", d: "M4 19V5h12l4 4v10zM8 9h6M8 13h8" },
    request: { c: "bg-[#FEF3DC] text-[#B7791F]", d: "M9 11l3 3 8-8M20 12v7H4V5h11" },
  };

  // ------------------------------------------------------------------ views
  return (
    <div className="space-y-5">
      {/* Role switcher */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {VIEWS.map((v) => {
          const fresh = counters[v.key] - seen[v.key];
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => go(v.key)}
              className={cn(
                "relative flex shrink-0 flex-col items-start rounded-2xl border px-4 py-2.5 text-start transition-colors",
                view === v.key ? "border-[#1F3C88] bg-[#1F3C88] text-white" : "border-[#1F3C88]/15 bg-white text-[#13294B]",
              )}
            >
              <span className="text-base font-black">{v.label}</span>
              <span className={cn("text-[11px]", view === v.key ? "text-white/75" : "text-[#13294B]/55")}>{v.who}</span>
              {fresh > 0 && view !== v.key && (
                <span className="absolute -top-1.5 -start-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D63C37] px-1 text-[11px] font-bold text-white">
                  {fresh}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {toast && (
        <div role="status" className="anim-pop fixed inset-x-0 top-20 z-50 mx-auto w-fit max-w-[92vw] rounded-2xl bg-[#13294B] px-5 py-3 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* ------------------------------------------------------- DIRECTORY */}
      {view === "directory" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <section className={cn(card, "p-5")}>
            <h2 className="font-display text-2xl font-black">ابحث وقارن</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["الكل", "الجزائر العاصمة", "وهران"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCity(c)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-bold", city === c ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
                  {c}
                </button>
              ))}
              <span className="mx-1 h-8 w-px bg-[#1F3C88]/10" />
              {(["الكل", "مدرسة خاصة", "مركز لغات", "مركز دعم", "تكوين مهني"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-bold", kind === k ? "bg-[#F5A524] text-[#13294B]" : "bg-[#FEF3DC] text-[#8A5A0B]")}>
                  {k}
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-2.5">
              {visible.map((s) => (
                <li key={s.id} className={cn("rounded-2xl border p-4 transition-colors", openSchool === s.id ? "border-[#1F3C88] bg-[#F5F8FF]" : "border-[#1F3C88]/10")}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1F3C88] font-display text-lg font-black text-white">{s.name.split(" ")[1]?.[0] ?? s.name[0]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-bold">
                        {s.name}
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F6EF] px-2 py-0.5 text-[11px] font-bold text-[#0C8A64]">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                          موثّقة
                        </span>
                      </p>
                      <p className="text-xs text-[#13294B]/60">{s.kind} · {s.city} · {s.area}</p>
                      <p className="mt-1 text-xs text-[#13294B]/70">{s.levels}</p>
                    </div>
                    <div className="text-end">
                      <Stars n={s.rating} />
                      <p className="num mt-1 text-sm font-bold">{fmt(s.fee)}<span className="text-[11px] font-normal text-[#13294B]/55"> / شهر</span></p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setOpenSchool(openSchool === s.id ? null : s.id)} className="h-9 flex-1 rounded-xl bg-[#1F3C88] text-sm font-bold text-white">
                      {openSchool === s.id ? "إخفاء" : "الصفحة والتقييمات"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompare((c) => (c.includes(s.id) ? c.filter((x) => x !== s.id) : [...c, s.id].slice(-3)))}
                      className={cn("h-9 rounded-xl border px-4 text-sm font-bold", compare.includes(s.id) ? "border-[#F5A524] bg-[#FEF3DC] text-[#8A5A0B]" : "border-[#1F3C88]/20 text-[#1F3C88]")}
                    >
                      {compare.includes(s.id) ? "في المقارنة" : "قارن"}
                    </button>
                  </div>
                  {openSchool === s.id && (
                    <div className="anim-pop mt-4 space-y-3 border-t border-[#1F3C88]/10 pt-4">
                      <p className="text-sm font-bold">تقييمات موثّقة من الأولياء</p>
                      {s.reviews.map((r, i) => (
                        <div key={i} className="rounded-xl bg-white p-3 ring-1 ring-[#1F3C88]/10">
                          <div className="flex items-center justify-between text-xs text-[#13294B]/60">
                            <span>{r.by}</span>
                            <Stars n={r.stars} />
                          </div>
                          <p className="mt-1 text-sm">{r.text}</p>
                          {r.reply && <p className="mt-2 rounded-lg bg-[#E9EEFB] px-3 py-2 text-xs text-[#1F3C88]"><b>ردّ المؤسسة:</b> {r.reply}</p>}
                        </div>
                      ))}
                      <div className="grid gap-2 rounded-xl bg-[#FEF3DC] p-3 sm:grid-cols-[1fr_1fr_auto]">
                        <input value={reqChild} onChange={(e) => setReqChild(e.target.value)} aria-label="اسم الطفل" className="h-10 rounded-lg border border-[#1F3C88]/15 bg-white px-3 text-sm" />
                        <input value={reqLevel} onChange={(e) => setReqLevel(e.target.value)} aria-label="المستوى" className="h-10 rounded-lg border border-[#1F3C88]/15 bg-white px-3 text-sm" />
                        <button type="button" onClick={() => sendRegistration(s)} className="h-10 rounded-lg bg-[#F5A524] px-4 text-sm font-black text-[#13294B]">
                          طلب تسجيل
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={cn(card, "h-fit p-5")}>
            <h2 className="font-display text-xl font-black">المقارنة</h2>
            {compare.length === 0 ? (
              <p className="mt-2 text-sm text-[#13294B]/60">اضغط «قارن» على مدرستين أو ثلاث لترى الفرق جنبًا إلى جنب.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[300px] text-sm">
                  <thead>
                    <tr className="text-[#13294B]/60">
                      <th className="py-2 text-start font-semibold"> </th>
                      {compare.map((id) => (
                        <th key={id} className="py-2 text-start font-bold text-[#13294B]">{byId(id).name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F3C88]/10">
                    {[
                      ["المدينة", (s: School) => s.city],
                      ["النوع", (s: School) => s.kind],
                      ["المستويات", (s: School) => s.levels],
                      ["الشهرية", (s: School) => fmt(s.fee)],
                      ["التقييم", (s: School) => s.rating.toFixed(1)],
                    ].map(([label, get]) => (
                      <tr key={label as string}>
                        <td className="py-2 text-[#13294B]/60">{label as string}</td>
                        {compare.map((id) => (
                          <td key={id} className="py-2 font-semibold">{(get as (s: School) => string)(byId(id))}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 rounded-xl bg-[#E9EEFB] p-3 text-xs text-[#1F3C88]">
              يقيّم فقط الوليّ الذي له ابن مسجّل فعلًا في المؤسسة. المؤسسة ترد علنًا ولا تستطيع حذف التقييم.
            </p>
          </section>
        </div>
      )}

      {/* ---------------------------------------------------------- PARENT */}
      {view === "parent" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <section className={cn(card, "p-5")}>
            <div className="flex items-center gap-3">
              <Avatar name="كريم بوعلام" tone="bg-[#E7F6EF] text-[#0C8A64]" />
              <div>
                <p className="font-bold">كريم بوعلام</p>
                <p className="text-xs text-[#13294B]/60">حساب واحد · 3 أبناء في 3 مؤسسات</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {CHILDREN.map((c) => {
                const n = events.filter((e) => e.childId === c.id && e.at === "الآن").length;
                return (
                  <button key={c.id} type="button" onClick={() => setChild(c.id)} className={cn("relative rounded-2xl border p-3 text-start", child === c.id ? "border-[#1F3C88] bg-[#F5F8FF]" : "border-[#1F3C88]/10")}>
                    <p className="font-black">{c.name}</p>
                    <p className="line-clamp-1 text-[11px] text-[#13294B]/60">{byId(c.schoolId).name}</p>
                    {n > 0 && <span className="absolute -top-1.5 -start-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D63C37] px-1 text-[11px] font-bold text-white">{n}</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm font-bold text-[#13294B]/70">{childObj.cls} · {childSchool.name}</p>
            <ul className="mt-2 space-y-2">
              {childEvents.length === 0 && <li className="text-sm text-[#13294B]/55">لا جديد.</li>}
              {childEvents.map((e) => (
                <li key={e.id} className={cn("flex items-start gap-3 rounded-2xl p-3", e.at === "الآن" ? "anim-pop bg-[#FFF8E6] ring-1 ring-[#F5A524]/40" : "bg-[#F5F8FF]")}>
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", evIcon[e.type].c)}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={evIcon[e.type].d} /></svg>
                  </span>
                  <p className="flex-1 text-sm font-semibold">{e.text}</p>
                  <span className="text-[11px] text-[#13294B]/50">{e.at}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-5">
            <section className={cn(card, "p-5")}>
              <h3 className="font-display text-lg font-black">المستحقات · {childFee.month}</h3>
              <p className="num mt-1 font-display text-3xl font-black">{fmt(childFee.amount)}</p>
              <div className="mt-3 flex gap-2 text-[11px] font-bold">
                {(["due", "pending", "confirmed"] as const).map((st) => (
                  <span key={st} className={cn("rounded-full px-2.5 py-1", childFee.status === st ? (st === "confirmed" ? "bg-[#0C8A64] text-white" : st === "pending" ? "bg-[#F5A524] text-[#13294B]" : "bg-[#D63C37] text-white") : "bg-[#F5F8FF] text-[#13294B]/45")}>
                    {st === "due" ? "مستحقة" : st === "pending" ? "بانتظار التأكيد" : "مؤكدة"}
                  </span>
                ))}
              </div>
              {childFee.status === "due" && (
                <button type="button" onClick={() => uploadReceipt(child)} className="mt-4 h-11 w-full rounded-xl bg-[#1F3C88] text-sm font-bold text-white">
                  رفع وصل الدفع (بريدي موب / CCP)
                </button>
              )}
            </section>

            {child === "adam" && absences.length > 0 && (
              <section className={cn(card, "p-5")}>
                <h3 className="font-display text-lg font-black">الغيابات</h3>
                {absences.map((a) => (
                  <div key={a.id} className="mt-3 rounded-xl bg-[#FDECEC]/60 p-3">
                    <p className="text-sm font-bold">غياب {a.date}</p>
                    {a.status === "new" ? (
                      <div className="mt-2 flex gap-2">
                        <input value={justify} onChange={(e) => setJustify(e.target.value)} aria-label="التبرير" className="h-10 flex-1 rounded-lg border border-[#1F3C88]/15 bg-white px-3 text-sm" />
                        <button type="button" onClick={() => sendJustification(a.id)} className="h-10 rounded-lg bg-[#1F3C88] px-3 text-sm font-bold text-white">تبرير</button>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs font-bold text-[#0C8A64]">{a.status === "sent" ? "أُرسل التبرير — بانتظار الإدارة" : "تبرير مقبول"}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {myReqs.length > 0 && (
              <section className={cn(card, "p-5")}>
                <h3 className="font-display text-lg font-black">طلبات التسجيل</h3>
                {myReqs.map((r) => (
                  <div key={r.id} className="mt-3">
                    <p className="text-sm font-bold">{r.child} · {byId(r.schoolId).name}</p>
                    <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
                      {REQ_STAGES.map((st, i) => (
                        <span key={st} className={cn("rounded-lg px-1 py-1.5", i <= r.stage ? "bg-[#0C8A64] text-white" : "bg-[#F5F8FF] text-[#13294B]/45")}>{st}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {child === "adam" && (
              <section className={cn(card, "p-5")}>
                <h3 className="font-display text-lg font-black">جروب {childObj.cls}</h3>
                <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto text-sm">
                  {chat.filter((m) => !m.hidden).slice(-4).map((m) => (
                    <li key={m.id} className={cn("rounded-xl px-3 py-2", m.from === "system" ? "bg-[#E9EEFB] text-xs font-bold text-[#1F3C88]" : "bg-[#F5F8FF]")}>
                      {m.from !== "system" && <b className="text-[#1F3C88]">{m.name}: </b>}
                      {m.from === "system" && `${m.name}: `}
                      {m.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <input value={parentMsg} onChange={(e) => setParentMsg(e.target.value)} placeholder="اكتب للأستاذة…" className="h-10 flex-1 rounded-full border border-[#1F3C88]/15 px-4 text-sm" />
                  <button
                    type="button"
                    onClick={() => {
                      if (!parentMsg.trim()) return;
                      addMsg({ from: "parent", name: "وليّ آدم", text: parentMsg.trim() });
                      setParentMsg("");
                    }}
                    className="h-10 rounded-full bg-[#1F3C88] px-4 text-sm font-bold text-white"
                  >
                    إرسال
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- SCHOOL */}
      {view === "school" && (
        <section className={cn(card, "p-5")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-black">مدرسة النجاح الخاصة</p>
              <p className="text-sm text-[#13294B]/60">حيدرة · لوحة الإدارة</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["طلبات جديدة", reqs.filter((r) => r.schoolId === "najah" && r.stage === 0).length, "text-[#B7791F]"],
                ["وصولات للتأكيد", fees.filter((f) => f.status === "pending" && f.childId === "adam").length + otherPending.filter((p) => !p.done).length, "text-[#1F3C88]"],
                ["تبريرات", absences.filter((a) => a.status === "sent").length, "text-[#D63C37]"],
              ].map(([l, n, c]) => (
                <div key={l as string} className="rounded-2xl bg-[#F5F8FF] px-3 py-2">
                  <p className={cn("num font-display text-2xl font-black", c as string)}>{n as number}</p>
                  <p className="text-[11px] text-[#13294B]/60">{l as string}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1">
            {([
              ["requests", "الاستقبال · التسجيلات"],
              ["fees", "المحاسبة · المستحقات"],
              ["absences", "البيداغوجيا · الغيابات"],
              ["group", "جروبات الأقسام"],
              ["team", "الأقسام والفريق"],
            ] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setSchoolTab(k)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold", schoolTab === k ? "bg-[#1F3C88] text-white" : "bg-[#E9EEFB] text-[#1F3C88]")}>
                {l}
              </button>
            ))}
          </div>

          {schoolTab === "requests" && (
            <div className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto md:grid md:grid-cols-5 md:overflow-visible">
              {REQ_STAGES.map((st, si) => (
                <div key={st} className="w-[62%] shrink-0 rounded-2xl bg-[#F5F8FF] md:w-auto">
                  <p className="flex items-center justify-between px-3 py-2.5 text-sm font-black">
                    {st}
                    <span className="num text-xs">{reqs.filter((r) => r.schoolId === "najah" && r.stage === si).length}</span>
                  </p>
                  <ul className="space-y-2 p-2 pt-0">
                    {reqs.filter((r) => r.schoolId === "najah" && r.stage === si).map((r) => (
                      <li key={r.id} className={cn("rounded-xl bg-white p-2.5 ring-1 ring-[#1F3C88]/10", si === 0 && "anim-pop ring-[#F5A524]")}>
                        <p className="text-[13px] font-bold">{r.child}</p>
                        <p className="text-[11px] text-[#13294B]/55">{r.level}</p>
                        {si < REQ_STAGES.length - 1 && (
                          <button type="button" onClick={() => advanceReq(r.id)} className="mt-2 w-full rounded-lg bg-[#E9EEFB] py-1.5 text-[11px] font-bold text-[#1F3C88]">
                            {REQ_STAGES[si + 1]} ←
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {schoolTab === "fees" && (
            <ul className="mt-4 space-y-2">
              {fees.filter((f) => f.childId === "adam").map((f) => (
                <li key={f.childId} className="flex items-center gap-3 rounded-2xl bg-[#F5F8FF] p-3">
                  <Avatar name="آدم بوعلام" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">وليّ آدم بوعلام · {f.month}</p>
                    <p className="num text-xs text-[#13294B]/60">{fmt(f.amount)}</p>
                  </div>
                  {f.status === "pending" ? (
                    <button type="button" onClick={() => confirmFee("adam")} className="rounded-xl bg-[#0C8A64] px-4 py-2 text-sm font-bold text-white">تأكيد الاستلام</button>
                  ) : (
                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold", f.status === "confirmed" ? "bg-[#E7F6EF] text-[#0C8A64]" : "bg-[#FDECEC] text-[#D63C37]")}>
                      {f.status === "confirmed" ? "مؤكدة" : "لم يرفع الوصل بعد"}
                    </span>
                  )}
                </li>
              ))}
              {otherPending.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-[#F5F8FF] p-3">
                  <Avatar name={p.parent.replace("وليّ ", "").replace("وليّة ", "")} />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{p.parent} · أكتوبر</p>
                    <p className="num text-xs text-[#13294B]/60">{fmt(p.amount)} · وصل مرفوع</p>
                  </div>
                  {p.done ? (
                    <span className="rounded-full bg-[#E7F6EF] px-3 py-1 text-xs font-bold text-[#0C8A64]">مؤكدة</span>
                  ) : (
                    <button type="button" onClick={() => setOtherPending((x) => x.map((y) => (y.id === p.id ? { ...y, done: true } : y)))} className="rounded-xl bg-[#0C8A64] px-4 py-2 text-sm font-bold text-white">
                      تأكيد الاستلام
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {schoolTab === "absences" && (
            <ul className="mt-4 space-y-2">
              {absences.length === 0 && <li className="rounded-2xl bg-[#F5F8FF] p-4 text-sm text-[#13294B]/60">لا غيابات اليوم. سجّلها من لوحة الأستاذ.</li>}
              {absences.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-[#F5F8FF] p-3">
                  <Avatar name="آدم بوعلام" tone="bg-[#FDECEC] text-[#D63C37]" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">آدم بوعلام · السنة 4 أ · {a.date}</p>
                    <p className="text-xs text-[#13294B]/60">{a.note ?? "لم يصل تبرير بعد"}</p>
                  </div>
                  {a.status === "sent" ? (
                    <button type="button" onClick={() => acceptJustification(a.id)} className="rounded-xl bg-[#1F3C88] px-4 py-2 text-sm font-bold text-white">قبول التبرير</button>
                  ) : (
                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold", a.status === "accepted" ? "bg-[#E7F6EF] text-[#0C8A64]" : "bg-[#FDECEC] text-[#D63C37]")}>{a.status === "accepted" ? "مبرَّر" : "غير مبرَّر"}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {schoolTab === "group" && (
            <div className="mt-4 rounded-2xl bg-[#F5F8FF] p-3">
              <p className="mb-2 text-sm font-bold">جروب السنة 4 ابتدائي — أ · تحت إشراف الإدارة</p>
              <ul className="space-y-1.5">
                {chat.map((m) => (
                  <li key={m.id} className={cn("flex items-start gap-2 rounded-xl bg-white p-2.5 text-sm", m.hidden && "opacity-40")}>
                    <span className="flex-1">
                      <b className="text-[#1F3C88]">{m.name}: </b>
                      {m.hidden ? "رسالة مخفية من الإدارة" : m.text}
                    </span>
                    {m.from === "parent" && !m.hidden && (
                      <button type="button" onClick={() => setChat((x) => x.map((y) => (y.id === m.id ? { ...y, hidden: true } : y)))} className="shrink-0 rounded-lg border border-[#D63C37]/30 px-2 py-1 text-[11px] font-bold text-[#D63C37]">
                        إخفاء
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {schoolTab === "team" && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["الاستقبال", ["أمال سعدي — مسؤولة التسجيلات"]],
                ["البيداغوجيا", ["أ. سميرة — السنة 4 أ", "أ. فريد — رياضيات المتوسط", "أ. ليلى — فرنسية"]],
                ["المحاسبة", ["نسيم بوزيد — المستحقات"]],
              ].map(([d, people]) => (
                <div key={d as string} className="rounded-2xl bg-[#F5F8FF] p-4">
                  <p className="font-display text-lg font-black">{d as string}</p>
                  {(people as string[]).map((p) => (
                    <p key={p} className="mt-2 flex items-center gap-2 text-sm"><Avatar name={p} />{p}</p>
                  ))}
                </div>
              ))}
              <p className="text-xs text-[#13294B]/60 md:col-span-3">الأساتذة موظفون داخل المؤسسة: لا حساب عام لهم، ويرون أقسامهم فقط.</p>
            </div>
          )}
        </section>
      )}

      {/* --------------------------------------------------------- TEACHER */}
      {view === "teacher" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={cn(card, "p-5")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-black">أ. سميرة</p>
                <p className="text-xs text-[#13294B]/60">مدرسة النجاح · السنة 4 ابتدائي — أ</p>
              </div>
              <span className="rounded-full bg-[#FEF3DC] px-3 py-1 text-xs font-bold text-[#8A5A0B]">الحصة الأولى · 08:00</span>
            </div>
            <p className="mt-4 text-sm font-bold">الحضور</p>
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {CLASS_4A.map((n) => (
                <li key={n}>
                  <button
                    type="button"
                    disabled={attendanceSent}
                    onClick={() => setAbsent((a) => ({ ...a, [n]: !a[n] }))}
                    className={cn("flex w-full items-center gap-2 rounded-xl border p-2 text-start text-sm font-semibold", absent[n] ? "border-[#D63C37]/40 bg-[#FDECEC]" : "border-[#1F3C88]/10")}
                  >
                    <Avatar name={n} tone={absent[n] ? "bg-[#D63C37] text-white" : undefined} />
                    <span className="flex-1">{n}</span>
                    <span className={cn("text-[11px] font-bold", absent[n] ? "text-[#D63C37]" : "text-[#0C8A64]")}>{absent[n] ? "غائب" : "حاضر"}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={sendAttendance} disabled={attendanceSent} className="mt-3 h-11 w-full rounded-xl bg-[#1F3C88] text-sm font-bold text-white disabled:opacity-50">
              {attendanceSent ? "أُرسل الحضور" : "إرسال الحضور"}
            </button>
            {!attendanceSent && <p className="mt-2 text-xs text-[#13294B]/55">جرّب: اضغط على «آدم» ليصبح غائبًا ثم أرسل، وانظر لوحة الولي.</p>}
          </section>

          <div className="space-y-5">
            <section className={cn(card, "p-5")}>
              <p className="font-display text-lg font-black">نقطة جديدة · آدم بوعلام</p>
              <div className="mt-2 flex gap-2">
                <input value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="النقطة" className="num h-11 w-24 rounded-xl border border-[#1F3C88]/15 px-3 text-center font-bold" />
                <span className="self-center text-sm text-[#13294B]/60">/ 20 · فرض الرياضيات</span>
                <button type="button" onClick={postGrade} className="ms-auto h-11 rounded-xl bg-[#0C8A64] px-4 text-sm font-bold text-white">إرسال</button>
              </div>
            </section>
            <section className={cn(card, "p-5")}>
              <p className="font-display text-lg font-black">واجب للقسم</p>
              <div className="mt-2 flex gap-2">
                <input value={hw} onChange={(e) => setHw(e.target.value)} aria-label="الواجب" className="h-11 flex-1 rounded-xl border border-[#1F3C88]/15 px-3 text-sm" />
                <button type="button" onClick={postHomework} className="h-11 rounded-xl bg-[#F5A524] px-4 text-sm font-black text-[#13294B]">نشر</button>
              </div>
            </section>
            <section className={cn(card, "p-5")}>
              <p className="font-display text-lg font-black">جروب القسم</p>
              <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto text-sm">
                {chat.filter((m) => !m.hidden).map((m) => (
                  <li key={m.id} className={cn("rounded-xl px-3 py-2", m.from === "system" ? "bg-[#E9EEFB] text-xs font-bold text-[#1F3C88]" : m.from === "teacher" ? "bg-[#1F3C88] text-white" : "bg-[#F5F8FF]")}>
                    {m.from !== "teacher" && <b>{m.name}: </b>}
                    {m.text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- STUDENT */}
      {view === "student" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={cn(card, "p-5")}>
            <div className="flex items-center gap-3">
              <Avatar name="ريان بوعلام" tone="bg-[#FEF3DC] text-[#8A5A0B]" />
              <div>
                <p className="font-bold">ريان بوعلام</p>
                <p className="text-xs text-[#13294B]/60">مركز أفق للغات · إنجليزية B1 — مسائي</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-bold">حصص هذا الأسبوع</p>
            <ul className="mt-2 space-y-2">
              {[
                ["الأحد", "18:00 – 19:30", "Speaking club"],
                ["الثلاثاء", "18:00 – 19:30", "Grammar B1"],
                ["الخميس", "18:00 – 19:30", "Mock test"],
              ].map(([d, t, s]) => (
                <li key={d} className="flex items-center justify-between rounded-xl bg-[#F5F8FF] p-3 text-sm">
                  <b>{d}</b>
                  <span className="num">{t}</span>
                  <span className="text-[#13294B]/65">{s}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={cn(card, "p-5")}>
            <p className="font-display text-lg font-black">من المركز</p>
            <ul className="mt-2 space-y-2">
              {events.filter((e) => e.childId === "rayan").map((e) => (
                <li key={e.id} className="rounded-xl bg-[#F5F8FF] p-3 text-sm font-semibold">{e.text}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl bg-[#FEF3DC] p-3">
              <p className="text-sm font-bold">مستحقات أكتوبر · {fmt(6000)}</p>
              <p className="text-xs text-[#8A5A0B]">{fees.find((f) => f.childId === "rayan")!.status === "confirmed" ? "مؤكدة" : "يدفعها الولي من حسابه"}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
