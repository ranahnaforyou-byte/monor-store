import { drive, DriveNotConfiguredError } from "./client";

/**
 * Archive an ORIGINAL image file to Drive under
 *   <root>/originals/products/<productId>/<name>
 * Returns the Drive file id, or null when Drive is not configured or the upload
 * fails (image archival must never block a product save).
 */
export async function archiveOriginalImage(
  productId: string,
  name: string,
  body: Buffer,
  mimeType: string,
): Promise<string | null> {
  if (!drive.isConfigured()) return null;
  try {
    const root = drive.rootFolderId();
    const originals = await drive.ensureFolder("originals", root);
    const products = await drive.ensureFolder("products", originals);
    const folder = await drive.ensureFolder(productId, products);
    const file = await drive.uploadFile(name, body, mimeType, folder);
    return file.id;
  } catch (err) {
    if (err instanceof DriveNotConfiguredError) return null;
    console.error("archiveOriginalImage failed", err);
    return null;
  }
}

/** Resolve (or create) a named sub-folder directly under the Drive root. */
export async function rootSubfolder(name: string): Promise<string | null> {
  if (!drive.isConfigured()) return null;
  try {
    return await drive.ensureFolder(name, drive.rootFolderId());
  } catch {
    return null;
  }
}
