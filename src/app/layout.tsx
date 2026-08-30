import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { getLocale } from "@/lib/i18n";
import { dirForLocale } from "@/lib/i18n/config";
import { siteConfig } from "@/config/site";
import "./globals.css";

const display = Cairo({
  subsets: ["arabic"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "ar_DZ",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0a7c43",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={dirForLocale(locale)}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
