import Link from "next/link";
import { requireTeamUser, isLead } from "@/lib/hanout/team-session";
import { teamLogout } from "@/app/actions/team";
import { Avatar } from "@/components/hanout/avatar";
import { toneFor } from "@/lib/hanout/format";

export const dynamic = "force-dynamic";

const CAN: Record<string, string[]> = {
  OWNER: ["كل الأقسام والطلبات", "لوحة الأرقام وترتيب الفريق", "إضافة الموظفين وتوزيع الأدوار", "إعدادات المتجر"],
  MANAGER: ["متابعة كل الأقسام", "لوحة الأرقام وترتيب الفريق", "توزيع الطلبات على الموظفين"],
  confirm: ["الطلبات الجديدة", "الاتصال بالزبون وتأكيد الطلب", "تسجيل: لم يرد، مؤجل، رقم خاطئ"],
  prepare: ["الطلبات المؤكدة", "التحضير والتغليف", "تمرير الطرد للشحن"],
  ship: ["الطرود الجاهزة", "اختيار شركة التوصيل", "تأكيد الوصول والدفع"],
};

export default async function TeamMePage() {
  const user = await requireTeamUser();
  const tone = toneFor(user);
  const perms = CAN[user.department?.slug ?? user.role] ?? [];

  return (
    <div className="space-y-4">
      <section className="hn-card flex flex-col items-center p-6 text-center">
        <Avatar user={user} size="lg" />
        <h1 className="mt-3 font-display text-xl font-black">{user.name}</h1>
        <p className={`mt-1 rounded-full px-3 py-1 text-xs font-bold ${tone.bg} ${tone.fg}`}>{user.title}</p>
      </section>

      <section className="hn-card p-4">
        <h2 className="mb-2 text-sm font-bold text-ink-soft">ما يمكنك فعله في النظام</h2>
        <ul className="space-y-1.5 text-sm">
          {perms.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="hn-card divide-y divide-line">
        {isLead(user) && (
          <Link href="/team/dashboard" className="block px-4 py-3 text-sm font-semibold">لوحة المالك</Link>
        )}
        <Link href="/system" className="block px-4 py-3 text-sm font-semibold">صفحة «النظام»</Link>
        <Link href="/shop" className="block px-4 py-3 text-sm font-semibold">متجر نور (واجهة الزبون)</Link>
        {isLead(user) && (
          <Link href="/admin" className="block px-4 py-3 text-sm font-semibold">لوحة الإدارة الكاملة</Link>
        )}
        <Link href="/team" className="block px-4 py-3 text-sm font-semibold">تبديل الدور</Link>
      </section>

      <form action={teamLogout}>
        <button className="h-11 w-full rounded-[var(--radius)] border border-line-strong bg-paper text-sm font-bold text-coral">
          تسجيل الخروج
        </button>
      </form>
    </div>
  );
}
