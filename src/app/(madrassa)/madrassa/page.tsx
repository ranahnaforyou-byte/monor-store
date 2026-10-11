import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MFooter, MHeader } from "@/components/madrassa/brand";

export const metadata: Metadata = {
  title: { absolute: "MA DRASSA — مدرستك كلها في منظومة واحدة" },
  description:
    "منظومة للمدارس الخاصة ومراكز اللغات والدعم والتكوين المهني: لكل موظف لوحته، وكل غياب ووصل وطلب تسجيل يصل لصاحبه فورًا. الجزائر العاصمة ووهران.",
};

const ROLES = [
  { key: "director", title: "المدير", line: "التسجيلات، المستحقات المحصّلة والمتأخرة، الغيابات، نتائج الأقسام، الصلاحيات والموافقات." },
  { key: "supervisor", title: "المستشار التربوي", line: "يقبل التبريرات أو يرفضها، يسجّل الانضباط، يستدعي الأولياء، ويعدّل استعمال الزمن." },
  { key: "reception", title: "الاستقبال", line: "طلبات التسجيل بمراحلها: جديد، اتصال، اختبار المستوى، مقبول، مسجّل. والملفات والمواعيد." },
  { key: "accounting", title: "المحاسبة", line: "المستحقات الشهرية، تأكيد وصولات بريدي موب وCCP، المتأخرون والتذكيرات." },
  { key: "teacher", title: "الأستاذ", line: "أقسامه فقط: الحضور، النقاط، الواجبات، ورسائل خاصة مع الأولياء." },
  { key: "parent", title: "الولي", line: "حساب واحد لكل أبنائه ولو في مؤسسات مختلفة: غيابات، نقاط، مستحقات، رسائل." },
  { key: "student", title: "التلميذ", line: "استعمال الزمن، الواجبات، النقاط والإعلانات." },
  { key: "directory", title: "الدليل العام", line: "بحث ومقارنة وتقييمات موثّقة من أولياء مسجّلين فقط، وطلب تسجيل مباشر." },
];

const FLOWS = [
  { title: "غياب", steps: ["الأستاذ يسجّل", "الولي يُنبَّه", "يرسل تبريرًا", "المستشار يقبل", "يظهر عند المدير"] },
  { title: "مستحقات", steps: ["الولي يرفع الوصل", "المحاسب يؤكّد", "الولي يُنبَّه", "المحصّل عند المدير"] },
  { title: "تسجيل", steps: ["طلب من الدليل", "الاستقبال", "اختبار المستوى", "موافقة المدير", "مسجّل ومستحقاته عند المحاسب"] },
];

const GAINS = [
  ["مستحقات تعرف أين وصلت", "كل وصل مرفوع يصل للمحاسب، وكل تأكيد يظهر في لوحتك. المتأخرون في قائمة واحدة مع تذكير بنقرة."],
  ["غياب يصل للولي في نفس الحصة", "الأستاذ يسجّل، الولي يُنبَّه فورًا، والتبرير يمر على المستشار قبل أن يصل إليك."],
  ["تسجيلات لا تضيع", "كل طلب له مرحلة ومسؤول وملف ناقص أو مكتمل. القبول النهائي يمر عليك."],
  ["لكل موظف ما يخصّه", "تحدّد من يرى المستحقات ومن يرى النقاط. الأستاذ يرى أقسامه فقط."],
];

const RULES = [
  ["لا مجموعات بين الأولياء", "الإعلانات والواجبات في اتجاه واحد. التواصل رسائل خاصة بين الولي والمدرسة، تطّلع عليها الإدارة."],
  ["تقييمات موثّقة فقط", "يقيّم الوليّ الذي له ابن مسجّل فعلًا. المؤسسة تردّ علنًا ولا تحذف، ولا يُقيَّم الأساتذة بأسمائهم."],
  ["الأستاذ موظف لديكم", "لا حساب عام له ولا ملف تقييم. يعمل داخل مؤسستكم وبصلاحيات تحددونها."],
];

export default function MadrassaHome() {
  return (
    <div dir="rtl" lang="ar" className="md-root min-h-dvh bg-[#F5F8FF] text-[#13294B]">
      <MHeader active="home" />

      {/* Hero: speaks to the director first */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:px-8">
        <div>
          <h1 className="font-display text-[40px] font-black leading-[1.12] sm:text-[60px]">
            مدرستك كلها
            <br />
            في منظومة واحدة
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-[#13294B]/75">
            للمدارس الخاصة ومراكز اللغات والدعم والتكوين المهني: لكل موظف لوحته، ولكل ولي حسابه. كل غياب، وصل دفع وطلب تسجيل يصل للشخص المعني فورًا — وأنت ترى المدرسة كاملة من لوحة المدير.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/madrassa/demo?view=director" className="inline-flex h-13 items-center justify-center rounded-2xl bg-[#1F3C88] px-7 py-3.5 font-bold text-white hover:bg-[#162C66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] focus-visible:ring-offset-2">
              افتح لوحة المدير
            </Link>
            <Link href="/madrassa/demo?view=teacher" className="inline-flex h-13 items-center justify-center rounded-2xl border border-[#1F3C88]/20 bg-white px-7 py-3.5 font-bold text-[#1F3C88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] focus-visible:ring-offset-2">
              جولة في 3 دقائق
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#13294B]/70">الجزائر العاصمة ووهران — عرض تجريبي بأسماء ومؤسسات وهمية.</p>
        </div>

        {/* The relay: one absence travelling across four roles */}
        <figure className="relative overflow-hidden rounded-[28px] bg-[#13294B] text-white" aria-label="مثال: مسار غياب واحد عبر أربعة أدوار">
          <div className="relative h-36 sm:h-44">
            <Image src="/madrassa/school-ofoq-hero.webp" alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#13294B] via-[#13294B]/30 to-transparent" />
            <span className="absolute bottom-3 start-5 rounded-full bg-white/90 px-3 py-1 text-[12px] font-bold text-[#13294B] sm:start-7">مدرسة الأفق — مؤسسة تجريبية</span>
          </div>
          <div className="p-5 pt-3 sm:p-7 sm:pt-4">
          <p className="text-sm font-bold text-white/60">صباح الأحد، الحصة الأولى</p>
          <ol className="mt-4 space-y-3">
            {[
              ["08:04", "الأستاذة سميرة", "سجّلت غياب آدم — 4 متوسط أ", "bg-[#F5A524] text-[#13294B]"],
              ["08:04", "وليّ آدم", "وصله تنبيه على هاتفه", "bg-white text-[#13294B]"],
              ["08:20", "وليّ آدم", "أرسل تبريرًا: موعد طبي", "bg-white text-[#13294B]"],
              ["08:35", "المستشار التربوي", "قبل التبرير", "bg-[#0A7554] text-white"],
              ["08:35", "المديرة", "تراه في «ما يحدث الآن»", "bg-[#E9EEFB] text-[#1F3C88]"],
            ].map(([t, who, what, tone], i) => (
              <li key={i} className="relay-step flex items-center gap-3" style={{ animationDelay: `${300 + i * 450}ms` }}>
                <span className="num w-11 shrink-0 text-[13px] text-white/55">{t}</span>
                <span className={`rounded-xl px-3 py-1.5 text-[13px] font-black ${tone}`}>{who}</span>
                <span className="min-w-0 flex-1 text-[14px] text-white/85">{what}</span>
              </li>
            ))}
          </ol>
          <figcaption className="mt-5 border-t border-white/10 pt-4 text-[13px] text-white/60">بدون مكالمة واحدة، وبدون مجموعة واتساب.</figcaption>
          </div>
        </figure>
      </section>

      {/* Gains for the institution */}
      <section id="why" className="scroll-mt-20 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-[24ch] font-display text-3xl font-black sm:text-4xl">ما تكسبه المؤسسة من اليوم الأول</h2>
          <div className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
            {GAINS.map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <svg viewBox="0 0 24 24" className="mt-1 h-6 w-6 shrink-0 text-[#F5A524]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                <div>
                <h3 className="font-display text-xl font-black">{t}</h3>
                <p className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-[#13294B]/70">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles with their own links */}
      <section id="roles" className="scroll-mt-20 mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-black sm:text-4xl">ثمانية أدوار، لكل دور رابطه</h2>
        <p className="mt-2 max-w-[60ch] text-[#13294B]/65">البطاقات البيضاء لفريق المدرسة، والزرقاء للعائلة والعموم. افتح أي دور مباشرة، أو دورين في نافذتين وشاهد ما يفعله أحدهما يصل للآخر.</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <li key={r.key}>
              <Link
                href={`/madrassa/demo?view=${r.key}`}
                className={`group flex h-full flex-col rounded-[20px] p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] ${i < 5 ? "bg-white ring-1 ring-[#1F3C88]/10 hover:ring-[#1F3C88]/40" : "bg-[#E9EEFB] hover:bg-[#DFE6F8]"}`}
              >
                <h3 className="font-display text-xl font-black">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#13294B]/70">{r.line}</p>
                <span className="mt-4 text-sm font-bold text-[#1F3C88] group-hover:underline">افتح اللوحة</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Flows */}
      <section id="links" className="scroll-mt-20 bg-[#13294B] py-14 text-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black sm:text-4xl">كل فعل يصل لصاحبه</h2>
          <p className="mt-2 max-w-[60ch] text-white/70">كل تفاعل طلبٌ بمراحل واضحة، ينتقل بين الأقسام، ويُنبَّه به الطرف المعني بشارة حمراء على لوحته.</p>
          <div className="mt-8 space-y-4">
            {FLOWS.map((f) => (
              <div key={f.title} className="rounded-[20px] bg-white/[0.06] p-4 sm:p-5">
                <h3 className="font-display text-lg font-black text-[#F5A524]">{f.title}</h3>
                <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {f.steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${i === f.steps.length - 1 ? "bg-[#0A7554]" : "bg-white/10"}`}>{s}</span>
                      {i < f.steps.length - 1 && <span aria-hidden className="text-[#F5A524]">←</span>}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-black sm:text-4xl">قواعد تحمي المدرسة</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {RULES.map(([t, d]) => (
            <div key={t} className="rounded-[20px] bg-white p-5 ring-1 ring-[#1F3C88]/10">
              <h3 className="font-display text-lg font-black">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#13294B]/70">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-5 rounded-[28px] bg-[#1F3C88] p-7 text-white sm:p-9 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-black sm:text-3xl">جرّبها كما سيستعملها فريقك</p>
            <p className="mt-2 max-w-[48ch] text-white/75">جولة موجّهة من تسع خطوات: غياب، تبرير، وصل دفع، وطلب تسجيل حتى موافقة المدير.</p>
          </div>
          <Link href="/madrassa/demo?view=teacher" className="inline-flex h-12 shrink-0 items-center rounded-2xl bg-[#F5A524] px-7 font-black text-[#13294B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            ابدأ الجولة
          </Link>
        </div>
      </section>

      <MFooter />
    </div>
  );
}
