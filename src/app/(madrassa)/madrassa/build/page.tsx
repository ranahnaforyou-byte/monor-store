import type { Metadata } from "next";
import { MFooter, MHeader } from "@/components/madrassa/brand";
import { Builder } from "@/components/madrassa/builder";

export const metadata: Metadata = {
  title: { absolute: "أنشئ نسخة عرض — MA DRASSA" },
  description: "املأ بيانات مؤسسة واحصل على رابط عرض جاهز بكل الأدوار.",
  robots: { index: false, follow: false },
};

export default function MadrassaBuildPage() {
  return (
    <div dir="rtl" lang="ar" className="md-root min-h-dvh bg-[#F5F8FF] text-[#13294B]">
      <MHeader active="demo" />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <h1 className="font-display text-3xl font-black sm:text-4xl">أنشئ نسخة عرض لمؤسسة</h1>
        <p className="mt-1 max-w-[60ch] text-[#13294B]/70">اختر قالبًا، وعدّل الخانات، ثم افتح الرابط أو انسخه. كل الأدوار والجلسات تعمل بهذه البيانات.</p>
        <div className="mt-6">
          <Builder />
        </div>
      </main>
      <MFooter />
    </div>
  );
}
