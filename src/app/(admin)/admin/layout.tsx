import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: "MONOR Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdmin();
  // Login page renders without chrome; proxy.ts guards everything else.
  if (!admin) return <>{children}</>;
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
