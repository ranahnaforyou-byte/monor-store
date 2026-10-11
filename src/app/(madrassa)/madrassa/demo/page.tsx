import type { Metadata } from "next";
import { MFooter, MHeader } from "@/components/madrassa/brand";
import { MadrassaDemo } from "@/components/madrassa/demo";

export const metadata: Metadata = {
  title: { absolute: "جرّب MA DRASSA — كل الأدوار" },
  description: "بدّل بين الدليل والولي والمؤسسة والأستاذ والتلميذ، وشاهد كيف يصل كل طلب لصاحبه.",
};

const VIEWS = ["directory", "parent", "school", "teacher", "student"] as const;

export default async function MadrassaDemoPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const initial = (VIEWS as readonly string[]).includes(view ?? "") ? (view as (typeof VIEWS)[number]) : "directory";
  return (
    <div dir="rtl" lang="ar" className="min-h-dvh bg-[#F5F8FF] text-[#13294B]">
      <MHeader active="demo" />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-black sm:text-4xl">جرّب المنظومة</h1>
        <p className="mt-1 text-[#13294B]/65">
          كل زر يغيّر شيئًا عند طرف آخر. جرّب: اطلب تسجيلًا من الدليل، ثم افتح «المؤسسة» وحرّك الطلب، ثم ارجع لـ«الولي».
        </p>
        <div className="mt-6">
          <MadrassaDemo initialView={initial} />
        </div>
        <p className="mt-6 text-center text-xs text-[#13294B]/50">عرض تجريبي · أسماء ومؤسسات وهمية · الجزائر العاصمة ووهران</p>
      </main>
      <MFooter />
    </div>
  );
}
