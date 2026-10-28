import { getBaseUrl } from "@/core/domains";
import { getArticleBySlug, getRelatedArticles } from "@/entities/article/api";
import { ArticleCard } from "@/widgets/article-grid/ui/ArticleCard";
import { RelatedArticles } from "@/widgets/article-grid/ui/RelatedArticles";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ArticlePageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * Формирует SEO-метаданные страницы статьи: Title, Description, Canonical, OpenGraph и Twitter Card.
 */
export const generateMetadata = async ({
    params,
}: ArticlePageProps): Promise<Metadata> => {
    const { slug } = await params;

    const [article, baseUrl] = await Promise.all([
        getArticleBySlug(slug, true),
        getBaseUrl(),
    ]);

    if (!article) {
        return {};
    }

    const canonicalUrl = `${baseUrl}/article/${article.slug}`;
    const ogImageUrl = article.previewImg
        ? article.previewImg.startsWith("http")
            ? article.previewImg
            : `${baseUrl}${article.previewImg}`
        : `${baseUrl}/images/default-avatar.png`;

    const publishedTime = (
        article.publishedAt ?? article.createdAt
    ).toISOString();
    const modifiedTime = article.updatedAt.toISOString();

    return {
        title: article.metaTitle,
        description: article.metaDescription,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: "article",
            url: canonicalUrl,
            title: article.metaTitle,
            description: article.metaDescription,
            siteName: "КРОТ Медиа",
            locale: "ru_RU",
            publishedTime,
            modifiedTime,
            authors: article.author?.name ? [article.author.name] : ["КРОТ Медиа"],
            tags: article.tags?.map((t) => t.name) ?? [],
            images: [
                {
                    url: ogImageUrl,
                    width: 1152,
                    height: 864,
                    alt: article.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: article.metaTitle,
            description: article.metaDescription,
            images: [ogImageUrl],
        },
    };
};

/**
 * Рендерит страницу полной статьи со схемой Schema.org NewsArticle (JSON-LD) и блоком перелинковки.
 */
const ArticlePage = async ({ params }: ArticlePageProps) => {
    const { slug } = await params;

    const [article, baseUrl] = await Promise.all([
        getArticleBySlug(slug, true),
        getBaseUrl(),
    ]);

    if (!article) {
        notFound();
    }

    const relatedArticles = await getRelatedArticles(
        article.id,
        article.tags.map((t) => t.id),
        3,
    );

    const canonicalUrl = `${baseUrl}/article/${article.slug}`;
    const imageUrl = article.previewImg
        ? article.previewImg.startsWith("http")
            ? article.previewImg
            : `${baseUrl}${article.previewImg}`
        : `${baseUrl}/images/default-avatar.png`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.metaDescription,
        image: [imageUrl],
        datePublished: (article.publishedAt ?? article.createdAt).toISOString(),
        dateModified: article.updatedAt.toISOString(),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
        },
        author: {
            "@type": "Person",
            name: article.author?.name ?? "КРОТ Медиа",
            url: article.author?.slug
                ? `${baseUrl}/author/${article.author.slug}`
                : baseUrl,
        },
        publisher: {
            "@type": "Organization",
            name: "КРОТ — Кроссхаб Российских Онлайн-Технологий",
            url: baseUrl,
            logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/images/default-avatar.png`,
            },
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleCard
                article={article}
                author={article.author}
                tags={article.tags}
                isFullArticle
            />
            <RelatedArticles articles={relatedArticles} />
        </>
    );
};
export default ArticlePage;
