import { getBaseUrl } from "@/core/domains";
import { getAllPublishedArticles } from "@/entities/article/api";
import { getAuthors } from "@/entities/author/api";
import { getTags } from "@/entities/tag/api";
import { MetadataRoute } from "next";

/**
 * Генерирует XML-карту сайта (sitemap.xml) с датами обновления и приоритетами страниц.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = await getBaseUrl();
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    if (process.env.BUILD_TIME) {
        return [...staticPages];
    }

    const [articles, tags, authors] = await Promise.all([
        getAllPublishedArticles(),
        getTags(),
        getAuthors(),
    ]);

    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${baseUrl}/article/${article.slug}`,
        lastModified: article.updatedAt ?? article.publishedAt ?? now,
        changeFrequency: "weekly",
        priority: 0.9,
    }));

    const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
        url: `${baseUrl}/tag/${tag.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
    }));

    const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
        url: `${baseUrl}/author/${author.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
    }));

    return [...staticPages, ...articlePages, ...tagPages, ...authorPages];
}

export const dynamic = "force-dynamic";
