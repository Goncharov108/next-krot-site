import { getArticleBySlug } from "@/entities/article/api";
import { getAuthors } from "@/entities/author/api";
import { getTags } from "@/entities/tag/api";
import { cn } from "@/shared/lib/cn";
import { AdminArticleRedactor } from "@/widgets/admin-article-redactor";
import { formatDateToMoscowDateTimeInput } from "@/widgets/admin-article-redactor/lib/moscowPublicationDate";
import { notFound } from "next/navigation";

interface AdminArticleRedactorPageProps {
    params: Promise<{
        slug: string;
    }>;
}

const AdminArticleRedactorPage = async ({
    params,
}: AdminArticleRedactorPageProps) => {
    const { slug } = await params;
    const [article, authors, availableTags] = await Promise.all([
        getArticleBySlug(slug),
        getAuthors(),
        getTags(),
    ]);

    if (!article) {
        notFound();
    }

    return (
        <section className="space-y-6">
            <h1
                className={cn(
                    "text-center text-4xl font-bold text-slate-500 md:text-5xl",
                )}
            >
                Редактирование статьи
            </h1>

            <AdminArticleRedactor
                article={{
                    originalSlug: article.slug,
                    slug: article.slug,
                    title: article.title,
                    metaTitle: article.metaTitle,
                    metaDescription: article.metaDescription,
                    previewImg: article.previewImg ?? "",
                    mainText: article.mainText,
                    readingTime: article.readingTime?.toString() ?? "",
                    isPublished: article.isPublished,
                    publishedAtMoscow: formatDateToMoscowDateTimeInput(
                        article.publishedAt ??
                            (article.isPublished ? article.createdAt : null),
                    ),
                    authorId: article.author.id,
                    tagIds: article.tags.map((tag) => tag.id),
                }}
                authors={authors}
                availableTags={availableTags}
            />
        </section>
    );
};

export default AdminArticleRedactorPage;
