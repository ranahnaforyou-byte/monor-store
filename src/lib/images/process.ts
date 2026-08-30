import sharp from "sharp";

export type ProcessedImage = {
  buffer: Buffer;
  contentType: string;
  ext: string;
  width: number;
  height: number;
  blurDataURL: string;
};

const MAX_WEB_WIDTH = 1600; // never upscale past this or the source width

/**
 * Produce a single web-optimized master from an arbitrary source image:
 * - EXIF stripped (sharp drops metadata unless asked to keep it)
 * - resized down to <= MAX_WEB_WIDTH (never upscaled — source images are small)
 * - re-encoded as WebP q82
 * - flattened onto white when the source has alpha (studio boot shots)
 * Next.js Image then derives responsive AVIF/WebP sizes from this master.
 */
export async function processProductImage(input: Buffer): Promise<ProcessedImage> {
  const src = sharp(input, { failOn: "none" }).rotate(); // apply orientation, then drop EXIF
  const meta = await src.metadata();

  const srcWidth = meta.width ?? MAX_WEB_WIDTH;
  const targetWidth = Math.min(srcWidth, MAX_WEB_WIDTH);
  const hasAlpha = Boolean(meta.hasAlpha);

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  if (hasAlpha) {
    pipeline = pipeline.flatten({ background: "#ffffff" });
  }
  pipeline = pipeline.resize({
    width: targetWidth,
    withoutEnlargement: true,
    fit: "inside",
  });

  const webp = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer({
    resolveWithObject: true,
  });

  const blur = await sharp(webp.data)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    buffer: webp.data,
    contentType: "image/webp",
    ext: "webp",
    width: webp.info.width,
    height: webp.info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}
