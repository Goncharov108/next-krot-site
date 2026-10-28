import Link from "next/link";
import { ArticleWithRelations } from "@/entities/article";

interface RelatedArticlesProps {
    articles: ArticleWithRelations[];
}

/**
 * Серверный блок внутренней перелинковки «Читайте также по теме» внизу полной статьи.
 */
export const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
    if (!articles.length) {
        return null;
    }

    return (
        <section
            aria-label="Читайте также по теме"
            className="mt-8 rounded-3xl bg-white p-6 dark:bg-gray-900"
        >
            <h2 className="mb-4 text-lg font-bold text-slate-900 md:text-xl dark:text-white">
                Читайте также по теме
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
                {articles.map((item) => (
                    <Link
                        key={item.id}
                        href={`/article/${item.slug}`}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-red-500 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-red-400"
                    >
                        <div className="space-y-2">
                            {item.tags?.[0] && (
                                <span className="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                    {item.tags[0].name}
                                </span>
                            )}
                            <h3 className="line-clamp-3 text-sm leading-snug font-semibold text-slate-900 transition group-hover:text-red-500 dark:text-white dark:group-hover:text-red-400">
                                {item.title}
                            </h3>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{item.author?.name ?? "КРОТ Медиа"}</span>
                            {item.readingTime && (
                                <span>{item.readingTime} мин</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
