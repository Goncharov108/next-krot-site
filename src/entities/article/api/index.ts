import { prisma } from "@/shared/lib/prisma";
import { ArticleWithRelations } from "../model";
import { getPublishedArticleWhere } from "../lib";

/**
 * Проставляет `publishedAt = createdAt` у опубликованных статей, где `publishedAt` был `null`,
 * чтобы зафиксировать дату первой публикации для старых статей в БД.
 */
const ensurePublishedArticleDates = async () => {
    await prisma.$executeRaw`
        UPDATE "Article"
        SET "publishedAt" = "createdAt"
        WHERE "isPublished" = true AND "publishedAt" IS NULL
    `;
};

interface GetArticlesParams {
    page: number;
    limit: number;
    filters?: {
        authorId?: number;
        tagId?: number;
    };
    isPublished?: boolean;
}

export const getArticles = async ({
    page,
    limit,
    filters,
    isPublished,
}: GetArticlesParams) => {
    await ensurePublishedArticleDates();

    return prisma.article.findMany({
        where: {
            authorId: filters?.authorId,
            tags: filters?.tagId
                ? {
                      some: {
                          id: filters.tagId,
                      },
                  }
                : undefined,
            ...(isPublished === true
                ? getPublishedArticleWhere()
                : { isPublished }),
        },
        include: {
            author: true,
            tags: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
            { isPublished: "asc" },
            { publishedAt: "desc" },
            { createdAt: "desc" },
        ],
    });
};

export const getArticleBySlug = async (
    slug: string,
    onlyAvailable = false,
): Promise<ArticleWithRelations | null> => {
    await ensurePublishedArticleDates();

    return prisma.article.findFirst({
        where: {
            slug,
            ...(onlyAvailable ? getPublishedArticleWhere() : {}),
        },
        include: {
            author: true,
            tags: true,
        },
    });
};

export const getAllPublishedArticles = async () => {
    await ensurePublishedArticleDates();

    return prisma.article.findMany({
        where: getPublishedArticleWhere(),
        select: {
            id: true,
            slug: true,
            title: true,
            metaDescription: true,
            previewImg: true,
            publishedAt: true,
            updatedAt: true,
            author: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            tags: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: {
            publishedAt: "desc",
        },
    });
};

/**
 * Возвращает список тематически близких опубликованных статей для блока внутренней перелинковки.
 */
export const getRelatedArticles = async (
    currentArticleId: number,
    tagIds: number[],
    limit = 3,
): Promise<ArticleWithRelations[]> => {
    await ensurePublishedArticleDates();

    const byTags =
        tagIds.length > 0
            ? await prisma.article.findMany({
                  where: {
                      ...getPublishedArticleWhere(),
                      id: { not: currentArticleId },
                      tags: {
                          some: {
                              id: { in: tagIds },
                          },
                      },
                  },
                  include: {
                      author: true,
                      tags: true,
                  },
                  orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
                  take: limit,
              })
            : [];

    if (byTags.length >= limit) {
        return byTags;
    }

    const excludeIds = [currentArticleId, ...byTags.map((a) => a.id)];
    const fallback = await prisma.article.findMany({
        where: {
            ...getPublishedArticleWhere(),
            id: { notIn: excludeIds },
        },
        include: {
            author: true,
            tags: true,
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: limit - byTags.length,
    });

    return [...byTags, ...fallback];
};
