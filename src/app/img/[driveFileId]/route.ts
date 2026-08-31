import { NextResponse } from "next/server";
import { drive } from "@/lib/drive/client";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * EMERGENCY Google Drive image proxy — NOT the normal delivery path.
 * Product images are served from the CDN / local disk. This exists only as a
 * last resort if a CDN object is ever missing. It is heavily rate-limited and
 * aggressively cached so it can never become the default.
 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ driveFileId: string }> },
) {
  const { driveFileId } = await ctx.params;
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(driveFileId)) {
    return new NextResponse("bad id", { status: 400 });
  }
  if (!drive.isConfigured()) {
    return new NextResponse("drive not configured", { status: 404 });
  }

  const ip = ipFromHeaders(request.headers);
  const gate = await rateLimit("img-proxy", ip, { limit: 60, windowSeconds: 60 });
  if (!gate.ok) return new NextResponse("slow down", { status: 429 });

  try {
    const buf = await drive.downloadFile(driveFileId);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
