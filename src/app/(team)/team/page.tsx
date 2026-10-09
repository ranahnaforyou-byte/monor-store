import type { Metadata } from "next";
import Link from "next/link";
import { publicEnv } from "@/lib/public-env";
import { demoLogin } from "@/app/actions/team";
import { STAFF, type DemoRoleKey } from "@/server/services/hanout";
import { HanoutLogo, DemoTag } from "@/components/hanout/logo";
import { Avatar } from "@/components/hanout/avatar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ادخل كأحد أفراد الفريق", robots: { index: false } };

const ROLES: { key: DemoRoleKey; role: string; does: string; dept: string | null; accent: string }[] = [
  { key: "owner", role: "المالك", does: "يرى كل شيء: الأرقام، الأقسام وترتيب الفريق", dept: null, accent: "border-brand/30 hover:border-brand" },
  { key: "manager", role: "المديرة", does: "تتابع الأقسام وتوزّع الطلبات", dept: null, accent: "border-ink/15 hover:border-ink/40" },
  { key: "confirm", role: "قسم التأكيد", does: "تتصل بالزبون وتؤكد الطلب", dept: "confirm", accent: "border-coral/30 hover:border-coral" },
  { key: "prepare", role: "قسم التحضير", does: "يجهّز الطلب ويغلّفه", dept: "prepare", accent: "border-saffron/50 hover:border-saffron" },
  { key: "ship", role: "قسم الشحن", does: "تسلّم الطرد لشركة التوصيل", dept: "ship", accent: "border-mint/40 hover:border-mint" },
];

export default function TeamLoginPage() {
  return (
    <div className="zellige min-h-dvh bg-surface">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 py-8">
        <Link href="/" className="self-center">
          <HanoutLogo size="lg" withLatin />
        </Link>
        <h1 className="mt-8 text-center font-display text-3xl font-black leading-tight">ادخل كأحد أفراد الفريق</h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          اختر دورًا وجرّب «النظام» من الداخل. كلّ واحد يرى قسمه ومهامه فقط.
        </p>

        {!publicEnv.demoMode ? (
          <p className="mt-8 rounded-[var(--radius)] bg-paper p-4 text-center text-sm text-muted">
            الدخول التجريبي متوقف. استعمل <Link className="text-brand underline" href="/admin/login">تسجيل الدخول</Link>.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {ROLES.map((r) => {
              const s = STAFF.find((x) => x.demoRole === r.key)!;
              return (
                <form key={r.key} action={demoLogin.bind(null, r.key)}>
                  <button
                    className={cn(
                      "hn-card flex w-full items-center gap-4 border-2 p-4 text-start transition-colors active:scale-[0.99]",
                      r.accent,
                    )}
                  >
                    <Avatar user={{ name: s.name, role: s.role, department: r.dept ? { slug: r.dept } : null }} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-black">{r.role}</span>
                      <span className="block text-sm font-semibold text-ink-soft">{s.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">{r.does}</span>
                    </span>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                </form>
              );
            })}
          </div>
        )}
        <div className="mt-auto flex flex-col items-center gap-2 pt-8">
          <DemoTag />
          <Link href="/shop" className="text-sm font-semibold text-brand">أو افتح المتجر كزبون</Link>
        </div>
      </div>
    </div>
  );
}
