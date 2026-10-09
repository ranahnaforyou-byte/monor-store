import QRCode from "qrcode";
import { headers } from "next/headers";

/** Absolute URL for a path on the host the visitor is using (LAN IP, Vercel domain…). */
export async function absoluteUrl(path: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || /^\d/.test(host) ? "http" : "https");
  return `${proto}://${host}${path}`;
}

export async function QrSvg({ path, className }: { path: string; className?: string }) {
  const url = await absoluteUrl(path);
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#13241f", light: "#ffffff00" },
  });
  return <div className={className} aria-label={`رمز QR يفتح ${url}`} role="img" dangerouslySetInnerHTML={{ __html: svg }} />;
}
