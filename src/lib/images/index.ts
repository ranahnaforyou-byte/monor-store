import type { ProductImage } from "@/generated/prisma";

export const PLACEHOLDER_IMAGE = "/placeholder/product.svg";

type MinimalImage = Pick<ProductImage, "url" | "alt" | "blurDataURL" | "width" | "height" | "isPrimary" | "position">;

export function primaryImage<T extends MinimalImage>(images: T[]): T | undefined {
  if (images.length === 0) return undefined;
  return images.find((i) => i.isPrimary) ?? [...images].sort((a, b) => a.position - b.position)[0];
}

export function imageAlt(fallback: string, image?: { alt?: string | null }): string {
  return image?.alt?.trim() ? image.alt : fallback;
}

export function hasBlur(image?: { blurDataURL?: string | null }): image is { blurDataURL: string } {
  return Boolean(image?.blurDataURL && image.blurDataURL.startsWith("data:"));
}
