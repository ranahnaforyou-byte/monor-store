import type { Metadata } from "next";
import Link from "next/link";
import { MFooter, MHeader } from "@/components/madrassa/brand";

export const metadata: Metadata = {
  title: { absolute: "MA DRASSA — كل مدارسك في منظومة واحدة" },
  description:
    "منظومة واحدة تجمع المدارس الخاصة ومراكز اللغات والدعم والتكوين المهني مع الأولياء والأساتذة: تسجيل، مستحقات، غيابات، نقاط وجروبات — في الجزائر العاصمة ووهران.",
};

const ROLES = [
  {
    title: "المؤسسة",
    line: "نظامها الداخلي كاملًا",
    points: ["أقسام: استقبال، بيداغوجيا، محاسبة", "طلبات التسجيل بمراحل واضحة", "المستحقات الشهرية وتأكيد الوصولات", "الغيابات والجروبات تحت إشرافها"],
    tone: "bg-[#1F3C88] text-white",
    icon: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6",
  },
  {
    title: "الأستاذ",
    line: "موظف داخل مؤسسته",
    points: ["أقسامه وحصصه اليوم", "الغياب بنقرة لكل تلميذ", "النقاط والواجبات", "يتواصل مع الأولياء عبر جروب القسم"],
    tone: "bg-[#F5A524] text-[#13294B]",
    icon: "M4 19V5h12l4 4v10zM8 9h6M8 13h8",
  },
  {
    title: "الولي",
    line: "حساب واحد لكل أبنائه",
    points: ["أبناء في مؤسسات مختلفة في مكان واحد", "تنبيه فوري بالغياب والنقاط", "دفع المستحقات برفع الوصل", "تقييم موثّق للمؤسسة"],
    tone: "bg-[#0C8A64] text-white",
    icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c.7-4 3.4-6 7-6s6.3 2 7 6M17 11a3 3 0 1 0 0-6M22 21c-.4-3-2-4.8-4.5-5.4",
  },
  {
    title: "التلميذ",
    line: "للغات والتكوين المهني",
    points: ["دوراته ومواعيدها", "حضوره ونتائجه", "إعلانات مركزه", "طلب دورة جديدة"],
    tone: "bg-[#E9EEFB] text-[#1F3C88]",
    icon: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5",
  },
];

const LINKS = [
  { title: "طلب تسجيل", flow: ["الولي", "الاستقبال", "اختبار المستوى", "مسجّل"] },
  { title: "المستحقات", flow: ["الولي يرفع الوصل", "المحاسبة", "مؤكد"] },
  { title: "الغياب", flow: ["الأستاذ يسجّل", "إشعار للولي", "تبرير", "الإدارة تقبل"] },
  { title: "جروب القسم", flow: ["الأستاذ", "الأولياء", "الإدارة تشرف"] },
];

export default function MadrassaHome() {
  return (
    <div dir="rtl" lang="ar" className="min-h-dvh bg-[#F5F8FF] text-[#13294B]">
      <MHeader active="home" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #1F3C88 1.2px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 pb-14 pt-14 text-center sm:px-6 md:pt-20 lg:px-8">
          <h1 className="font-display text-[46px] font-black leading-[1.1] text-[#13294B] sm:text-[72px]">
            كل مدارسك
            <br />
            <span className="relative inline-block">
              في منظومة واحدة
              <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden className="absolute inset-x-0 -bottom-2 h-[0.22em] w-full text-[#F5A524]">
                <path d="M4 16 C 70 6, 150 4, 296 10 C 210 12, 120 14, 20 21 Z" fill="currentColor" />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[56ch] text-lg text-[#13294B]/75">
            المدارس الخاصة، مراكز اللغات والدعم والتكوين المهني، الأولياء والأساتذة — كلٌّ بلوحته ونظامه، ومترابطون في مكان واحد
            منظّم بدل منشورات متفرقة ومجموعات واتساب.
          </p>

          <Link
            href="/madrassa/demo?view=directory"
            className="mx-auto mt-8 flex h-14 max-w-[620px] items-center gap-3 rounded-2xl border border-[#1F3C88]/15 bg-white px-5 text-start shadow-[0_10px_30px_-12px_rgba(31,60,136,.35)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#1F3C88]" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="flex-1 text-[15px] text-[#13294B]/55">ابحث عن مدرسة أو مركز في الجزائر العاصمة أو وهران…</span>
            <span className="rounded-xl bg-[#1F3C88] px-4 py-2 text-sm font-bold text-white">بحث</span>
          </Link>

          <p className="mt-3 text-sm font-semibold text-[#1F3C88]/70">الجزائر العاصمة · وهران</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/madrassa/demo" className="inline-flex h-12 items-center rounded-full bg-[#1F3C88] px-7 font-bold text-white hover:bg-[#162C66]">
              جرّب المنظومة بكل أدوارها
            </Link>
            <Link href="#roles" className="inline-flex h-12 items-center rounded-full border border-[#1F3C88]/20 bg-white px-7 font-bold text-[#1F3C88]">
              لكل طرف لوحته
            </Link>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-20 mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center font-display text-3xl font-black sm:text-4xl">لكل طرف لوحته ونظامه</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <Link key={r.title} href={`/madrassa/demo?view=${r.title === "المؤسسة" ? "school" : r.title === "الأستاذ" ? "teacher" : r.title === "الولي" ? "parent" : "student"}`} className="group flex flex-col rounded-[24px] border border-[#1F3C88]/10 bg-white p-6 transition-transform hover:-translate-y-0.5">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${r.tone}`}>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={r.icon} />
                </svg>
              </span>
              <h3 className="mt-4 font-display text-2xl font-black">{r.title}</h3>
              <p className="text-sm text-[#13294B]/60">{r.line}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {r.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5A524]" />
                    {p}
                  </li>
                ))}
              </ul>
              <span className="mt-5 text-sm font-bold text-[#1F3C88] group-hover:underline">افتح لوحة {r.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How they link */}
      <section id="links" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-black sm:text-4xl">كيف ترتبط اللوحات ببعضها</h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-center text-[#13294B]/65">
            كل تفاعل بين طرفين طلبٌ يمر بمراحل واضحة، ويصل للقسم المعني في المؤسسة، ويُشعَر به الطرف الآخر فورًا.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {LINKS.map((l) => (
              <div key={l.title} className="rounded-[24px] border border-[#1F3C88]/10 bg-[#F5F8FF] p-5">
                <p className="font-display text-xl font-black">{l.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {l.flow.map((s, i) => (
                    <span key={s} className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${i === l.flow.length - 1 ? "bg-[#0C8A64] text-white" : "bg-white text-[#1F3C88]"}`}>{s}</span>
                      {i < l.flow.length - 1 && <span className="text-[#F5A524]">←</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="scroll-mt-20 mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-black sm:text-4xl">لماذا MA DRASSA؟</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[#D63C37]/20 bg-white p-6">
            <p className="font-display text-xl font-black text-[#D63C37]">اليوم: فيسبوك وواتساب</p>
            <ul className="mt-3 space-y-2 text-[15px] text-[#13294B]/75">
              <li>إعلانات مختلطة بلا مقارنة ولا تقييم موثوق</li>
              <li>مجموعات واتساب فوضوية لكل قسم</li>
              <li>متابعة المستحقات بالهاتف والورق</li>
              <li>كل مؤسسة ببرنامجها، ولا شيء يجمعها</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-[#0C8A64]/25 bg-white p-6">
            <p className="font-display text-xl font-black text-[#0C8A64]">مع MA DRASSA</p>
            <ul className="mt-3 space-y-2 text-[15px] text-[#13294B]/75">
              <li>دليل منظّم: بحث، مقارنة، وتقييمات موثّقة من الأولياء فقط</li>
              <li>جروب لكل قسم تشرف عليه المؤسسة</li>
              <li>مستحقات بوصل مرفوع وتأكيد من المحاسبة</li>
              <li>حساب واحد للولي لكل أبنائه ومؤسساتهم</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-[28px] bg-[#1F3C88] p-8 text-center text-white">
          <p className="font-display text-3xl font-black">جرّب المنظومة الآن</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-white/80">بدّل بين الولي والمؤسسة والأستاذ، وشاهد كيف يصل كل طلب لصاحبه فورًا.</p>
          <Link href="/madrassa/demo" className="mt-5 inline-flex h-12 items-center rounded-full bg-[#F5A524] px-8 font-black text-[#13294B]">
            ابدأ التجربة
          </Link>
        </div>
      </section>

      <MFooter />
    </div>
  );
}
