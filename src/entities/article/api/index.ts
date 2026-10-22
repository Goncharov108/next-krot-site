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
            slug: true,
            publishedAt: true,
            updatedAt: true,
        },
        orderBy: {
            publishedAt: "desc",
        },
    });
};
