import { getBaseUrl } from "@/core/domains";
import { getAllPublishedArticles } from "@/entities/article/api";

export const dynamic = "force-dynamic";

/**
 * Экранирует спецсимволы XML в заголовках и описаниях RSS-ленты.
 */
const escapeXml = (str: string): string =>
    str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

/**
 * Генерирует RSS 2.0 ленту опубликованных статей КРОТ Медиа (/rss.xml) для Дзена, агрегаторов и ридеров.
 */
export async function GET(): Promise<Response> {
    const baseUrl = await getBaseUrl();
    const articles = process.env.BUILD_TIME
        ? []
        : await getAllPublishedArticles();

    const latestArticles = articles.slice(0, 50);

    const itemsXml = latestArticles
        .map((article) => {
            const url = `${baseUrl}/article/${article.slug}`;
            const pubDate = (
                article.publishedAt ??
                article.updatedAt ??
                new Date()
            ).toUTCString();
            const authorName = escapeXml(article.author?.name ?? "КРОТ Медиа");
            const categoriesXml = (article.tags ?? [])
                .map((tag) => `<category>${escapeXml(tag.name)}</category>`)
                .join("");
            const imageEnclosure = article.previewImg
                ? `<enclosure url="${escapeXml(
                      article.previewImg.startsWith("http")
                          ? article.previewImg
                          : `${baseUrl}${article.previewImg}`,
                  )}" type="image/jpeg" />`
                : "";

            return `
        <item>
            <title>${escapeXml(article.title)}</title>
            <link>${url}</link>
            <guid isPermaLink="true">${url}</guid>
            <description>${escapeXml(article.metaDescription)}</description>
            <pubDate>${pubDate}</pubDate>
            <author>${authorName}</author>
            ${categoriesXml}
            ${imageEnclosure}
        </item>`;
        })
        .join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>КРОТ Медиа — Кроссхаб Российских Онлайн-Технологий</title>
        <link>${baseUrl}</link>
        <description>Журнал о том, как технологии и нейросети помогают зарабатывать, экономить время и не выгорать</description>
        <language>ru</language>
        <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
        ${itemsXml}
    </channel>
</rss>`;

    return new Response(rssXml.trim(), {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
    });
}
