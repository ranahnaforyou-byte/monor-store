import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { getStoreSettings } from "@/server/services/settings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  if (settings.maintenanceMode) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-2xl font-extrabold">MONOR STORE</p>
        <p className="text-muted">المتجر في صيانة مؤقتة. نعود قريباً.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {settings.announcementActive && <AnnouncementBar text={settings.announcementBar} />}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
