"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Template = {
  key: string;
  label: string;
  item: string; // what a "request" is called
  stages: string[];
  depts: { name: string; color: string }[];
  team: { name: string; role: string; dept: number | null }[];
  tasks: { title: string; who: string; stage: number }[];
  quickAdd: string;
};

const TEMPLATES: Template[] = [
  {
    key: "cafe",
    label: "مقهى",
    item: "طلب",
    stages: ["جديد", "يُحضَّر", "جاهز", "قُدِّم"],
    depts: [
      { name: "الاستقبال", color: "bg-coral-soft text-coral-strong" },
      { name: "المطبخ", color: "bg-saffron-soft text-[#9a6d00]" },
      { name: "الخدمة", color: "bg-mint-soft text-[#0f7a52]" },
    ],
    team: [
      { name: "سليم بوعلام", role: "المدير", dept: null },
      { name: "ريم عباسي", role: "استقبال", dept: 0 },
      { name: "كريم سعيدي", role: "مطبخ", dept: 1 },
      { name: "إيناس مزيان", role: "خدمة", dept: 2 },
    ],
    tasks: [
      { title: "طاولة 4 · قهوة ×2 + كرواسون", who: "كريم", stage: 1 },
      { title: "طاولة 7 · شاي بالنعناع", who: "إيناس", stage: 2 },
      { title: "توصيل · عصير برتقال ×3", who: "ريم", stage: 0 },
      { title: "طاولة 2 · إسبريسو", who: "إيناس", stage: 3 },
    ],
    quickAdd: "طاولة 9 · قهوة بالحليب",
  },
  {
    key: "training",
    label: "مركز تكوين",
    item: "تسجيل",
    stages: ["طلب تسجيل", "اختبار المستوى", "مؤكد ومدفوع", "في الفوج"],
    depts: [
      { name: "الاستقبال", color: "bg-coral-soft text-coral-strong" },
      { name: "البيداغوجيا", color: "bg-saffron-soft text-[#9a6d00]" },
      { name: "المحاسبة", color: "bg-mint-soft text-[#0f7a52]" },
    ],
    team: [
      { name: "نادية بلقاسم", role: "المديرة", dept: null },
      { name: "سارة حمدي", role: "استقبال", dept: 0 },
      { name: "أ. مراد", role: "أستاذ إنجليزية", dept: 1 },
      { name: "ليلى عمراني", role: "محاسبة", dept: 2 },
    ],
    tasks: [
      { title: "أمين · إنجليزية B1 · مسائي", who: "سارة", stage: 0 },
      { title: "هبة · تحضير IELTS", who: "أ. مراد", stage: 1 },
      { title: "يونس · فرنسية A2", who: "ليلى", stage: 2 },
      { title: "دنيا · إنجليزية B2", who: "أ. مراد", stage: 3 },
    ],
    quickAdd: "زائر حضوري · إنجليزية مبتدئ",
  },
  {
    key: "agency",
    label: "وكالة",
    item: "مشروع",
    stages: ["طلب عميل", "قيد التنفيذ", "مراجعة", "سُلِّم"],
    depts: [
      { name: "الحسابات", color: "bg-coral-soft text-coral-strong" },
      { name: "التصميم", color: "bg-saffron-soft text-[#9a6d00]" },
      { name: "المحتوى", color: "bg-mint-soft text-[#0f7a52]" },
    ],
    team: [
      { name: "ياسين قادري", role: "المدير", dept: null },
      { name: "منال زروقي", role: "مسؤولة حسابات", dept: 0 },
      { name: "أنيس شريف", role: "مصمم", dept: 1 },
      { name: "هند نوري", role: "صانعة محتوى", dept: 2 },
    ],
    tasks: [
      { title: "متجر نور · 10 فيديوهات تيك توك", who: "هند", stage: 1 },
      { title: "مطعم الأصيل · شعار جديد", who: "أنيس", stage: 2 },
      { title: "عيادة الأمل · حملة إنستغرام", who: "منال", stage: 0 },
      { title: "مقهى الركن · قائمة طعام", who: "أنيس", stage: 3 },
    ],
    quickAdd: "عميل جديد · هوية بصرية",
  },
  {
    key: "workshop",
    label: "ورشة",
    item: "طلبية",
    stages: ["طلبية جديدة", "قيد الصنع", "جاهزة", "سُلِّمت"],
    depts: [
      { name: "الطلبيات", color: "bg-coral-soft text-coral-strong" },
      { name: "الإنتاج", color: "bg-saffron-soft text-[#9a6d00]" },
      { name: "التسليم", color: "bg-mint-soft text-[#0f7a52]" },
    ],
    team: [
      { name: "عبد القادر منصوري", role: "معلّم الورشة", dept: null },
      { name: "سمية بن علي", role: "طلبيات", dept: 0 },
      { name: "حمزة رحال", role: "نجار", dept: 1 },
      { name: "وليد قاسي", role: "تسليم", dept: 2 },
    ],
    tasks: [
      { title: "مطبخ خشبي · حيدرة", who: "حمزة", stage: 1 },
      { title: "باب خارجي · الشراقة", who: "سمية", stage: 0 },
      { title: "خزانة ملابس · بئر مراد رايس", who: "وليد", stage: 2 },
      { title: "طاولة اجتماعات · مكتب", who: "وليد", stage: 3 },
    ],
    quickAdd: "زبون حضوري · رفوف مكتبة",
  },
];

const STAGE_COLORS = ["bg-coral-soft", "bg-saffron-soft", "bg-[#e6f6ee]", "bg-mint-soft"];

function initials(n: string) {
  const p = n.replace(/^أ\. /, "").split(" ");
  return (p[0]?.[0] ?? "") + (p[1]?.[0] ?? "");
}

export function BusinessDemo() {
  const [tplKey, setTplKey] = useState("cafe");
  const tpl = TEMPLATES.find((t) => t.key === tplKey)!;
  const [tasks, setTasks] = useState(tpl.tasks);
  const [chat, setChat] = useState<string[]>([]);
  const [added, setAdded] = useState(0);

  function pick(key: string) {
    const t = TEMPLATES.find((x) => x.key === key)!;
    setTplKey(key);
    setTasks(t.tasks);
    setChat([`تم إنشاء نظام «${t.label}»: ${t.depts.length} أقسام · ${t.team.length} أعضاء · ${t.stages.length} مراحل`]);
    setAdded(0);
  }

  function advance(i: number) {
    const t = tasks[i];
    if (!t || t.stage >= tpl.stages.length - 1) return;
    const moved = { ...t, stage: t.stage + 1 };
    setTasks((ts) => ts.map((x, j) => (j === i ? moved : x)));
    setChat((c) => [...c.slice(-5), `${moved.who}: «${moved.title}» ← ${tpl.stages[moved.stage]}`]);
  }

  function quickAdd() {
    const title = added === 0 ? tpl.quickAdd : `${tpl.quickAdd} (${added + 1})`;
    setTasks((ts) => [{ title, who: tpl.team[1].name.split(" ")[0], stage: 0 }, ...ts]);
    setChat((c) => [...c.slice(-5), `${tpl.item} جديد من الاستقبال: ${title}`]);
    setAdded((n) => n + 1);
  }

  return (
    <div className="space-y-5">
      {/* Template picker */}
      <section className="hn-card p-5">
        <h2 className="font-display text-2xl font-black">اختر نوع نشاطك</h2>
        <p className="mt-1 text-sm text-muted">كل قالب يجهّز الأقسام والأدوار ومراحل العمل تلقائيًا.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => pick(t.key)}
              className={cn(
                "rounded-2xl border-2 px-4 py-4 text-lg font-black transition-colors",
                tplKey === t.key ? "border-saffron bg-saffron-soft" : "border-line bg-paper text-ink-soft",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Board */}
        <section className="hn-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-black">لوحة {tpl.label}</h2>
            <button type="button" onClick={quickAdd} className="h-10 rounded-full bg-brand px-4 text-sm font-bold text-white">
              + {tpl.item} حضوري
            </button>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 md:grid md:grid-cols-4 md:overflow-visible">
            {tpl.stages.map((st, si) => (
              <div key={st} className="w-[70%] shrink-0 rounded-2xl border border-line bg-surface/60 md:w-auto">
                <div className={cn("flex items-center justify-between rounded-t-2xl px-3 py-2.5", STAGE_COLORS[si])}>
                  <p className="text-sm font-black">{st}</p>
                  <span className="num text-xs font-bold">{tasks.filter((t) => t.stage === si).length}</span>
                </div>
                <ul className="space-y-2 p-2">
                  {tasks.map((t, i) =>
                    t.stage === si ? (
                      <li key={`${t.title}-${i}`} className="anim-pop rounded-xl border border-line bg-paper p-2.5">
                        <p className="text-[13px] font-bold leading-snug">{t.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-saffron-soft text-[9px] font-bold text-[#9a6d00]">{initials(t.who)}</span>
                            {t.who}
                          </span>
                          {si < tpl.stages.length - 1 && (
                            <button type="button" onClick={() => advance(i)} className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
                              {tpl.stages[si + 1]} ←
                            </button>
                          )}
                        </div>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          {/* Departments + roles */}
          <section className="hn-card p-5">
            <h2 className="font-display text-xl font-black">الأقسام والأدوار</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tpl.depts.map((d) => (
                <span key={d.name} className={cn("rounded-full px-3 py-1.5 text-sm font-bold", d.color)}>
                  قسم {d.name}
                </span>
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {tpl.team.map((m) => (
                <li key={m.name} className="flex items-center gap-3">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold", m.dept === null ? "bg-brand-soft text-brand" : tpl.depts[m.dept].color)}>
                    {initials(m.name)}
                  </span>
                  <span className="flex-1 text-sm font-bold">{m.name}</span>
                  <span className="text-xs text-muted">{m.role}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Team chat */}
          <section className="hn-card p-5">
            <h2 className="font-display text-xl font-black">جروب الفريق</h2>
            <ul className="mt-3 space-y-2">
              {chat.length === 0 && <li className="text-sm text-muted">حرّك مهمة أو أضف {tpl.item} حضوري، وسيكتب النظام هنا تلقائيًا.</li>}
              {chat.map((c, i) => (
                <li key={`${c}-${i}`} className="anim-pop rounded-xl bg-brand-soft px-3 py-2 text-[13px] font-semibold text-brand">
                  {c}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
