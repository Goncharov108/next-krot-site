export const isArticleAvailableForPublication = (
    isPublished: boolean,
    publishedAt: Date | string | null,
    now = new Date(),
) => {
    if (!isPublished) {
        return false;
    }

    if (!publishedAt) {
        return true;
    }

    return new Date(publishedAt).getTime() <= now.getTime();
};

export const getPublishedArticleWhere = () => ({
    isPublished: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
});

/**
 * Возвращает зафиксированную дату публикации статьи (`publishedAt` -> `createdAt` -> `updatedAt`),
 * чтобы последующие правки текста (`updatedAt`) не меняли дату выхода статьи.
 */
export const getArticleDisplayDate = (article: {
    publishedAt?: Date | string | null;
    createdAt?: Date | string | null;
    updatedAt: Date | string;
}): Date => {
    const rawDate = article.publishedAt ?? article.createdAt ?? article.updatedAt;

    return rawDate instanceof Date ? rawDate : new Date(rawDate);
};

/**
 * Форматирует дату выхода статьи на русском языке (например: «22 октября 2026 г.»).
 */
export const formatArticleDisplayDate = (article: {
    publishedAt?: Date | string | null;
    createdAt?: Date | string | null;
    updatedAt: Date | string;
}): string => {
    return getArticleDisplayDate(article).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};
