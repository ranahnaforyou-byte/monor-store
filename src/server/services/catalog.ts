import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { tags } from "@/lib/cache";
import type { Prisma } from "@/generated/prisma";

export const PAGE_SIZE = 24;

export type CatalogSort = "newest" | "price-asc" | "price-desc" | "name-asc";
export type CatalogTag = "new" | "sale" | "featured";

export type CatalogParams = {
  categorySlug?: string;
  brands?: string[];
  sizes?: string[];
  minPrice?: number; // centimes
  maxPrice?: number; // centimes
  inStockOnly?: boolean;
  tag?: CatalogTag;
  q?: string;
  sort?: CatalogSort;
  page?: number;
};

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  nameFr: true,
  brand: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  sale: true,
  newArrival: true,
  featured: true,
  sizes: true,
  images: {
    orderBy: { position: "asc" },
    take: 2,
    select: {
      url: true,
      alt: true,
      blurDataURL: true,
      width: true,
      height: true,
      isPrimary: true,
      position: true,
    },
  },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

function orderBy(sort: CatalogSort = "newest"): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "name-asc":
      return { name: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

function buildWhere(params: CatalogParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  const and: Prisma.ProductWhereInput[] = [];

  if (params.categorySlug) where.category = { slug: params.categorySlug };
  if (params.brands?.length) where.brand = { in: params.brands };
  if (params.sizes?.length) where.sizes = { hasSome: params.sizes };
  if (params.inStockOnly) where.stock = { gt: 0 };
  if (params.tag === "new") where.newArrival = true;
  if (params.tag === "sale") where.sale = true;
  if (params.tag === "featured") where.featured = true;

  if (params.minPrice != null || params.maxPrice != null) {
    where.price = {
      ...(params.minPrice != null ? { gte: params.minPrice } : {}),
      ...(params.maxPrice != null ? { lte: params.maxPrice } : {}),
    };
  }

  if (params.q?.trim()) {
    const q = params.q.trim();
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { nameFr: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (and.length) where.AND = and;
  return where;
}

async function queryProducts(params: CatalogParams) {
  const page = Math.max(1, params.page ?? 1);
  const where = buildWhere(params);
  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: orderBy(params.sort),
      select: productCardSelect,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);
  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Cached catalog listing. Tagged `products` so admin edits refresh it. */
export const listProducts = cache((params: CatalogParams) => {
  const key = JSON.stringify(params);
  return unstable_cache(() => queryProducts(params), ["catalog", key], {
    tags: [tags.products],
    revalidate: 600,
  })();
});

export const getProductBySlug = cache((slug: string) =>
  unstable_cache(
    () =>
      db.product.findFirst({
        where: { slug, status: "ACTIVE" },
        include: {
          category: { select: { slug: true, name: true, nameFr: true } },
          images: { orderBy: { position: "asc" } },
          sizeStock: { orderBy: { size: "asc" } },
        },
      }),
    ["product", slug],
    { tags: [tags.products, tags.product(slug)], revalidate: 3600 },
  )(),
);

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export const listCategories = cache(() =>
  unstable_cache(
    () =>
      db.category.findMany({
        orderBy: [{ position: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
      }),
    ["categories"],
    { tags: [tags.categories], revalidate: 3600 },
  )(),
);

export const getCategoryBySlug = cache((slug: string) =>
  unstable_cache(
    () => db.category.findUnique({ where: { slug } }),
    ["category", slug],
    { tags: [tags.categories, tags.category(slug)], revalidate: 3600 },
  )(),
);

export const listBrands = cache(() =>
  unstable_cache(
    async () => {
      const rows = await db.product.findMany({
        where: { status: "ACTIVE" },
        distinct: ["brand"],
        select: { brand: true },
        orderBy: { brand: "asc" },
      });
      return rows.map((r) => r.brand);
    },
    ["brands"],
    { tags: [tags.products], revalidate: 3600 },
  )(),
);

export const relatedProducts = cache((productId: string, categoryId: string | null) =>
  unstable_cache(
    () =>
      db.product.findMany({
        where: {
          status: "ACTIVE",
          id: { not: productId },
          ...(categoryId ? { categoryId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: productCardSelect,
      }),
    ["related", productId, categoryId ?? "none"],
    { tags: [tags.products], revalidate: 3600 },
  )(),
);

export const featuredProducts = cache(() =>
  unstable_cache(
    () =>
      db.product.findMany({
        where: { status: "ACTIVE", featured: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: productCardSelect,
      }),
    ["featured"],
    { tags: [tags.products, tags.homepage], revalidate: 600 },
  )(),
);

export const newArrivals = cache(() =>
  unstable_cache(
    () =>
      db.product.findMany({
        where: { status: "ACTIVE", newArrival: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: productCardSelect,
      }),
    ["new-arrivals"],
    { tags: [tags.products, tags.homepage], revalidate: 600 },
  )(),
);

export const allActiveSlugs = cache(() =>
  db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
);
