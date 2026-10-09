import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireTeamUser, isLead } from "@/lib/hanout/team-session";
import { DEPT_STATUSES, getDeptCounts, shortRef, type DeptSlug } from "@/server/services/hanout";
import { formatDZD } from "@/lib/money";
import { HanoutMark } from "@/components/hanout/logo";
import { Avatar } from "@/components/hanout/avatar";
import { TabBar } from "@/components/hanout/tab-bar";
import { LiveRefresh } from "@/components/hanout/live-refresh";
import { NewOrderAlert } from "@/components/hanout/new-order-alert";
import { toneFor } from "@/lib/hanout/format";

export const metadata: Metadata = {
  title: "تطبيق الفريق",
  robots: { index: false },
  manifest: "/team.webmanifest",
};
export const viewport: Viewport = { themeColor: "#0b6b4f" };
export const dynamic = "force-dynamic";

export default async function TeamAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeamUser();
  const counts = await getDeptCounts();
  const lead = isLead(user);
  const dept = (user.department?.slug ?? "confirm") as DeptSlug;

  // What should ring on this device: new orders for the confirm desk / leads,
  // otherwise whatever just landed in this member's department.
  const watched = await db.order.findMany({
    where: { status: { in: lead ? ["PENDING"] : DEPT_STATUSES[dept] } },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: { reference: true, customerName: true, wilayaName: true, total: true },
  });
  const tone = toneFor(user);

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col md:border-x md:border-line md:bg-surface">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
          <Link href="/team/me" className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar user={user} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{user.name}</span>
              <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.bg} ${tone.fg}`}>
                {user.title ?? tone.label}
              </span>
            </span>
          </Link>
          <Link href="/system" className="flex items-center gap-1.5 text-brand" aria-label="صفحة النظام">
            <HanoutMark className="h-6 w-6" />
            <span className="font-display text-lg font-black">حانوت</span>
          </Link>
        </header>

        <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
        <TabBar lead={lead} badge={lead ? counts.confirm : counts[dept]} />
      </div>
      <LiveRefresh />
      <NewOrderAlert
        storageKey={`hn-seen-${user.id}`}
        items={watched.map((o) => ({
          ref: o.reference,
          label: `${shortRef(o.reference)} · ${o.customerName} · ${o.wilayaName} · ${formatDZD(o.total)}`,
        }))}
      />
    </div>
  );
}
