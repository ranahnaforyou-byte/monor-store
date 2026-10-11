"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ROLES, act, unread, useWorld, type Role } from "./store";
import { DemoCtx, focus } from "./ui";
import { AccountingView } from "./views/accounting";
import { DirectorView } from "./views/director";
import { DirectoryView } from "./views/directory";
import { ParentView } from "./views/parent";
import { ReceptionView } from "./views/reception";
import { StudentView } from "./views/student";
import { SupervisorView } from "./views/supervisor";
import { TeacherView } from "./views/teacher";

const GROUPS: { label: string; roles: Role[] }[] = [
  { label: "داخل المدرسة", roles: ["director", "supervisor", "reception", "accounting", "teacher"] },
  { label: "العائلة", roles: ["parent", "student"] },
  { label: "للجميع", roles: ["directory"] },
];

/** The 3-minute tour: each step names the role to open and what to press. */
const TOUR: { role: Role; text: string }[] = [
  { role: "teacher", text: "الأستاذة: اجعل «آدم» غائبًا وأرسل الحضور" },
  { role: "parent", text: "الولي: وصله التنبيه — أرسل تبريرًا" },
  { role: "supervisor", text: "المستشار: اقبل التبرير" },
  { role: "director", text: "المدير: كل شيء يظهر في «ما يحدث الآن»" },
  { role: "parent", text: "الولي: ارفع وصل مستحقات أكتوبر" },
  { role: "accounting", text: "المحاسب: أكّد الاستلام" },
  { role: "directory", text: "الدليل: اطلب تسجيلًا في مدرسة الأفق" },
  { role: "reception", text: "الاستقبال: حرّك الطلب حتى «اختبار المستوى» ثم اطلب الموافقة" },
  { role: "director", text: "المدير: وافق على القبول من «الموافقات»" },
];

const VIEWS: Record<Role, () => React.JSX.Element> = {
  director: DirectorView,
  supervisor: SupervisorView,
  reception: ReceptionView,
  accounting: AccountingView,
  teacher: TeacherView,
  parent: ParentView,
  student: StudentView,
  directory: DirectoryView,
};

export function MadrassaDemo({ initialView }: { initialView: Role }) {
  const w = useWorld();
  const [view, setView] = useState<Role>(initialView);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [step, setStep] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 20000);
    return () => window.clearInterval(id);
  }, []);

  // what you're looking at is read; badges stay on the other roles
  useEffect(() => {
    act.markRead(view);
  }, [view, w.notes]);

  const flash = useCallback((t: string) => {
    setToast(t);
    setNow(Date.now());
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3400);
  }, []);

  function go(r: Role) {
    setView(r);
    const url = new URL(window.location.href);
    url.searchParams.set("view", r);
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const View = VIEWS[view];
  const tour = TOUR[step];

  return (
    <DemoCtx.Provider value={{ flash, now }}>
      <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-6">
        {/* role switcher: chip rail on phones, sidebar on desktop */}
        <nav aria-label="الأدوار" className="sticky top-16 z-30 -mx-4 border-b border-[#1F3C88]/10 bg-[#F5F8FF]/95 px-4 py-2.5 backdrop-blur lg:top-24 lg:mx-0 lg:h-fit lg:border-0 lg:bg-transparent lg:p-0">
          <div className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-4 lg:overflow-visible">
            {GROUPS.map((g) => (
              <div key={g.label} className="flex shrink-0 gap-2 lg:flex-col lg:gap-1">
                <p className="hidden px-3 text-[12px] font-bold text-[#13294B]/45 lg:block">{g.label}</p>
                {g.roles.map((key) => {
                  const r = ROLES.find((x) => x.key === key)!;
                  const n = view === key ? 0 : unread(w, key);
                  const active = view === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => go(key)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-start transition-colors lg:w-full lg:py-2.5",
                        focus,
                        active ? "bg-[#1F3C88] text-white" : "bg-white text-[#13294B] ring-1 ring-[#1F3C88]/12 hover:bg-[#EEF2FC] lg:bg-transparent lg:ring-0",
                      )}
                    >
                      <span className="flex flex-col leading-tight">
                        <span className="text-[15px] font-black">{r.label}</span>
                        <span className={cn("text-[11px]", active ? "text-white/70" : "text-[#13294B]/50")}>{r.who}</span>
                      </span>
                      {n > 0 && (
                        <span className="num anim-pop absolute -top-1.5 -start-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D63C37] px-1 text-[11px] font-bold text-white lg:static lg:ms-auto" aria-label={`${n} جديد`}>
                          {n}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-6 hidden space-y-2 lg:block">
            <p className="px-3 text-[12px] leading-relaxed text-[#13294B]/55">افتح دورين في نافذتين جنبًا إلى جنب: ما يفعله أحدهما يظهر عند الآخر فورًا.</p>
            <button type="button" onClick={() => { act.reset(); setStep(0); flash("أُعيدت البيانات التجريبية"); }} className={cn("mx-3 text-[13px] font-bold text-[#1F3C88] underline-offset-4 hover:underline", focus)}>
              أعد البيانات من البداية
            </button>
          </div>
        </nav>

        <div className="min-w-0 pt-4 lg:pt-0">
          {/* guided tour */}
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#13294B] p-3 text-white sm:p-3.5">
            <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A524] font-black text-[#13294B]">{step + 1}</span>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">
              <span className="text-white/55">جولة {step + 1}/{TOUR.length} — </span>
              {tour.text}
            </p>
            {view !== tour.role ? (
              <button type="button" onClick={() => go(tour.role)} className={cn("h-9 shrink-0 rounded-xl bg-white px-3 text-[13px] font-bold text-[#13294B]", focus)}>افتح</button>
            ) : (
              <button type="button" onClick={() => setStep((s) => (s + 1) % TOUR.length)} className={cn("h-9 shrink-0 rounded-xl bg-[#F5A524] px-3 text-[13px] font-bold text-[#13294B]", focus)}>
                {step === TOUR.length - 1 ? "من جديد" : "التالي"}
              </button>
            )}
          </div>

          <View />

          <div className="mt-6 flex items-center justify-center gap-4 lg:hidden">
            <button type="button" onClick={() => { act.reset(); setStep(0); flash("أُعيدت البيانات التجريبية"); }} className={cn("text-[13px] font-bold text-[#1F3C88]", focus)}>
              أعد البيانات من البداية
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div role="status" className="anim-pop fixed inset-x-0 bottom-5 z-50 mx-auto w-fit max-w-[92vw] rounded-2xl bg-[#13294B] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(19,41,75,.6)]">
          {toast}
        </div>
      )}
    </DemoCtx.Provider>
  );
}
