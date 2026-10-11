import type { Metadata } from "next";
import { MFooter, MHeader } from "@/components/madrassa/brand";
import { MadrassaDemo } from "@/components/madrassa/demo";
import type { Role } from "@/components/madrassa/store";

const ROLE_KEYS: Role[] = ["director", "supervisor", "reception", "accounting", "teacher", "parent", "student", "directory"];

export const metadata: Metadata = {
  title: { absolute: "جرّب MA DRASSA — كل الأدوار" },
  description: "المدير، المستشار، الاستقبال، المحاسبة، الأستاذ، الولي، التلميذ والدليل: كل فعل يصل لصاحبه فورًا.",
};

export default async function MadrassaDemoPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const initial: Role = ROLE_KEYS.includes(view as Role) ? (view as Role) : "director";
  return (
    <div dir="rtl" lang="ar" className="min-h-dvh bg-[#F5F8FF] text-[#13294B]">
      <MHeader active="demo" />
      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-2 sm:px-6 lg:px-8 lg:pt-8">
        <MadrassaDemo key={initial} initialView={initial} />
        <p className="mt-8 text-center text-xs text-[#13294B]/50">بيانات تجريبية — أسماء ومؤسسات وهمية، تُحفظ في متصفحك فقط</p>
      </main>
      <MFooter />
    </div>
  );
}
