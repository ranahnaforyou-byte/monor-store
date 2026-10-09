/**
 * Generates the placeholder product tiles for the Hanout expo demo:
 *   public/uploads/hanout/<slug>.webp  (800×800, flat illustrations)
 *
 *   npx tsx scripts/gen-hanout-images.ts
 *
 * Replace with real photos later (same file names) — nothing else changes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "uploads", "hanout");

const EM = "#0B6B4F";
const EM2 = "#0E8A66";
const SAF = "#F5B700";
const COR = "#FF5A4E";
const INK = "#16302A";
const CREAM = "#FFF9EE";

type Tile = { slug: string; bg: string; blob: string; art: string };

const shadow = `<ellipse cx="400" cy="640" rx="220" ry="26" fill="#000" opacity=".07"/>`;

const tiles: Tile[] = [
  {
    slug: "coffee-set",
    bg: "#F6EEE2",
    blob: "#EAD9C0",
    art: `${shadow}
      <rect x="170" y="560" width="460" height="40" rx="20" fill="${SAF}"/>
      <path d="M330 300 q70 -40 140 0 l-10 250 h-120z" fill="${EM}"/>
      <rect x="350" y="260" width="100" height="40" rx="14" fill="${EM2}"/>
      <path d="M470 330 q70 10 50 90 q-10 40 -55 40" fill="none" stroke="${EM}" stroke-width="22"/>
      <path d="M330 340 l-60 -40" stroke="${EM}" stroke-width="20" stroke-linecap="round"/>
      <rect x="200" y="480" width="90" height="80" rx="18" fill="${CREAM}" stroke="${EM}" stroke-width="10"/>
      <rect x="510" y="480" width="90" height="80" rx="18" fill="${CREAM}" stroke="${EM}" stroke-width="10"/>
      <path d="M345 420 h110" stroke="${SAF}" stroke-width="10"/>`,
  },
  {
    slug: "table-lamp",
    bg: "#F3F0E6",
    blob: "#E3EBDD",
    art: `${shadow}
      <path d="M290 230 h220 l60 170 h-340z" fill="${SAF}"/>
      <path d="M300 250 h200" stroke="#fff" stroke-width="8" opacity=".5"/>
      <rect x="388" y="400" width="24" height="170" fill="${INK}"/>
      <rect x="310" y="570" width="180" height="50" rx="25" fill="${EM}"/>`,
  },
  {
    slug: "cookware-set",
    bg: "#F1EFEA",
    blob: "#DDE7E1",
    art: `${shadow}
      <rect x="200" y="380" width="300" height="230" rx="40" fill="${EM}"/>
      <rect x="180" y="350" width="340" height="50" rx="25" fill="${EM2}"/>
      <rect x="320" y="315" width="60" height="40" rx="14" fill="${INK}"/>
      <rect x="500" y="460" width="150" height="150" rx="34" fill="${COR}"/>
      <rect x="490" y="440" width="170" height="36" rx="18" fill="#E6463B"/>
      <path d="M140 450 h60 M500 450 h0" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>`,
  },
  {
    slug: "care-gift-box",
    bg: "#F6EFE6",
    blob: "#EADFCC",
    art: `${shadow}
      <path d="M190 360 h420 v250 h-420z" fill="#C9A273"/>
      <path d="M190 360 l60 -70 h300 l60 70z" fill="#D9B88E"/>
      <rect x="250" y="250" width="60" height="150" rx="16" fill="${INK}"/>
      <rect x="262" y="225" width="36" height="35" rx="8" fill="${SAF}"/>
      <rect x="330" y="280" width="60" height="120" rx="16" fill="${CREAM}" stroke="${EM}" stroke-width="8"/>
      <rect x="410" y="300" width="130" height="100" rx="40" fill="#fff" stroke="${EM}" stroke-width="8"/>
      <path d="M560 300 q30 -60 70 -40 q-20 50 -70 40z" fill="${EM2}"/>
      <rect x="380" y="360" width="40" height="250" fill="${COR}" opacity=".85"/>`,
  },
  {
    slug: "perfume",
    bg: "#F5EFEA",
    blob: "#EFD9D4",
    art: `${shadow}
      <rect x="290" y="330" width="220" height="290" rx="50" fill="${EM}"/>
      <rect x="310" y="350" width="70" height="230" rx="30" fill="#fff" opacity=".18"/>
      <rect x="360" y="270" width="80" height="70" rx="10" fill="${SAF}"/>
      <rect x="340" y="220" width="120" height="60" rx="20" fill="${INK}"/>
      <rect x="330" y="450" width="140" height="60" rx="10" fill="${CREAM}"/>`,
  },
  {
    slug: "moisturizer",
    bg: "#F4F1EC",
    blob: "#DCE9E3",
    art: `${shadow}
      <rect x="250" y="420" width="300" height="200" rx="60" fill="#fff" stroke="${EM}" stroke-width="12"/>
      <rect x="240" y="350" width="320" height="90" rx="34" fill="${SAF}"/>
      <rect x="320" y="490" width="160" height="56" rx="14" fill="${EM}"/>
      <circle cx="560" cy="300" r="26" fill="${EM2}" opacity=".5"/>
      <circle cx="610" cy="250" r="14" fill="${EM2}" opacity=".35"/>`,
  },
  {
    slug: "wireless-earbuds",
    bg: "#EEF1F0",
    blob: "#D9E4F0",
    art: `${shadow}
      <rect x="260" y="400" width="280" height="210" rx="100" fill="#fff" stroke="${INK}" stroke-width="12"/>
      <path d="M260 470 h280" stroke="${INK}" stroke-width="8"/>
      <circle cx="400" cy="540" r="10" fill="${EM}"/>
      <path d="M300 250 q-50 0 -50 60 q0 60 50 60 v80" fill="none" stroke="${EM}" stroke-width="40" stroke-linecap="round"/>
      <path d="M500 250 q50 0 50 60 q0 60 -50 60 v80" fill="none" stroke="${EM}" stroke-width="40" stroke-linecap="round"/>`,
  },
  {
    slug: "smartwatch",
    bg: "#EFEFEA",
    blob: "#E6E0F0",
    art: `${shadow}
      <rect x="350" y="150" width="100" height="500" rx="40" fill="${INK}"/>
      <rect x="280" y="290" width="240" height="240" rx="64" fill="#1F3A33"/>
      <rect x="300" y="310" width="200" height="200" rx="50" fill="${EM}"/>
      <path d="M340 430 l40 -50 l40 40 l50 -70" fill="none" stroke="${SAF}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="520" y="370" width="20" height="60" rx="8" fill="${SAF}"/>`,
  },
  {
    slug: "power-bank",
    bg: "#F2F0EA",
    blob: "#F3E3C0",
    art: `${shadow}
      <rect x="280" y="190" width="240" height="430" rx="46" fill="${INK}"/>
      <rect x="310" y="230" width="180" height="300" rx="28" fill="#24433A"/>
      <path d="M410 280 l-60 110 h50 l-20 100 l70 -130 h-50z" fill="${SAF}"/>
      <circle cx="350" cy="575" r="10" fill="${EM2}"/><circle cx="385" cy="575" r="10" fill="${EM2}"/><circle cx="420" cy="575" r="10" fill="${EM2}"/><circle cx="455" cy="575" r="10" fill="#3F5C53"/>`,
  },
  {
    slug: "bluetooth-speaker",
    bg: "#EDF0EC",
    blob: "#D6E8DF",
    art: `${shadow}
      <rect x="200" y="330" width="400" height="290" rx="120" fill="${EM}"/>
      <circle cx="320" cy="475" r="70" fill="#095A42"/><circle cx="320" cy="475" r="30" fill="${SAF}"/>
      <circle cx="480" cy="475" r="70" fill="#095A42"/><circle cx="480" cy="475" r="30" fill="${SAF}"/>
      <path d="M300 330 q100 -90 200 0" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>`,
  },
  {
    slug: "leather-handbag",
    bg: "#F5EEE5",
    blob: "#EBD8C2",
    art: `${shadow}
      <path d="M310 320 q0 -110 90 -110 q90 0 90 110" fill="none" stroke="#7A4A26" stroke-width="26"/>
      <path d="M220 330 h360 l30 290 h-420z" fill="#A9622E"/>
      <path d="M220 330 h360 l-20 90 h-320z" fill="#8E4F23"/>
      <rect x="375" y="400" width="50" height="40" rx="8" fill="${SAF}"/>`,
  },
  {
    slug: "running-sneakers",
    bg: "#F0F0EB",
    blob: "#E0EAE4",
    art: `${shadow}
      <path d="M170 520 q20 -120 110 -150 l70 -30 q40 60 120 70 l120 30 q60 20 50 80 z" fill="#fff" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
      <path d="M160 520 h480 q10 40 -30 70 h-420 q-40 -20 -30 -70z" fill="${EM}"/>
      <path d="M300 400 l40 30 M340 380 l40 30 M380 365 l40 30" stroke="${SAF}" stroke-width="14" stroke-linecap="round"/>
      <path d="M470 440 q60 0 130 40" fill="none" stroke="${COR}" stroke-width="14" stroke-linecap="round"/>`,
  },
];

function svg(t: Tile) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="${t.bg}"/>
    <circle cx="560" cy="250" r="260" fill="${t.blob}"/>
    <circle cx="150" cy="700" r="160" fill="${t.blob}" opacity=".6"/>
    ${t.art}
  </svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest: Record<string, { w: number; h: number; blur: string }> = {};
  for (const t of tiles) {
    const buf = await sharp(Buffer.from(svg(t))).webp({ quality: 88 }).toBuffer();
    await writeFile(path.join(OUT, `${t.slug}.webp`), buf);
    const tiny = await sharp(buf).resize(16, 16).webp({ quality: 40 }).toBuffer();
    manifest[t.slug] = { w: 800, h: 800, blur: `data:image/webp;base64,${tiny.toString("base64")}` };
    console.log("wrote", t.slug);
  }
  await writeFile(
    path.join(process.cwd(), "src", "lib", "hanout-image-manifest.ts"),
    `/** Auto-generated by scripts/gen-hanout-images.ts — placeholder product tiles. */\n` +
      `export const HANOUT_IMAGES: Record<string, { w: number; h: number; blur: string }> = ${JSON.stringify(manifest, null, 2)};\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
