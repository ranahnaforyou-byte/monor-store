import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/hanout/site-chrome";
import { CraftsDemo } from "@/components/hanout/crafts-demo";
import { DemoTag, Swash } from "@/components/hanout/logo";
import { getHnLang } from "@/lib/hanout/lang";

export const metadata: Metadata = {
  title: "حانوت للحرفيين",
  description: "أقرب حرفي، طلب، ومحادثة — والورشة توزّع العمل على مساعديها.",
};
export const dynamic = "force-dynamic";

export default async function CraftsPage() {
  const lang = await getHnLang();
  return (
    <div dir="rtl" lang="ar">
      <SiteHeader active="/crafts" lang={lang} />
      <section className="zellige">
        <div className="mx-auto max-w-[1240px] px-4 pb-8 pt-10 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-[52px] font-black leading-none text-[#0d2b22] sm:text-[80px]">
            حانوت{" "}
            <span className="relative inline-block">
              للحرفيين
              <Swash className="-bottom-2 h-[0.2em]" />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg text-ink-soft">
            الزبون يجد أقرب حرفي ويطلبه ويتحدث معه، والورشة تقبل الطلب وتوزّعه على مساعديها — بنفس «النظام».
          </p>
          <div className="mt-3 flex justify-center">
            <DemoTag />
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 lg:px-8">
        <CraftsDemo />
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
