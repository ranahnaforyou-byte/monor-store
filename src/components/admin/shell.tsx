import Link from "next/link";
import { logout } from "@/app/actions/admin-auth";
import type { SessionPayload } from "@/lib/auth/session";

const NAV = [
  { href: "/admin", label: "لوحة القيادة", exact: true },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "الفئات" },
  { href: "/admin/inventory", label: "المخزون" },
  { href: "/admin/customers", label: "العملاء" },
  { href: "/admin/payments", label: "المدفوعات" },
  { href: "/admin/shipping", label: "الشحن" },
  { href: "/admin/statistics", label: "الإحصائيات" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-surface md:grid-cols-[240px_1fr]">
      <aside className="hidden border-e border-line bg-paper md:flex md:flex-col">
        <div className="flex h-14 items-center px-5 font-display text-lg font-extrabold">
          MONOR<span className="text-brand"> ADMIN</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-2 text-ink-soft hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="border-t border-line p-3">
          <button className="w-full rounded-[var(--radius)] px-3 py-2 text-start text-sm text-muted hover:bg-surface">
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-line bg-paper px-4">
          <nav className="flex gap-1 overflow-x-auto text-xs md:hidden">
            {NAV.map((i) => (
              <Link key={i.href} href={i.href} className="whitespace-nowrap rounded px-2 py-1 text-ink-soft hover:bg-surface">
                {i.label}
              </Link>
            ))}
          </nav>
          <span className="ms-auto text-sm text-muted">
            {admin.name} · <span className="text-xs">{admin.role}</span>
          </span>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
