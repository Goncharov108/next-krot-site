import Image from "next/image";
import Link from "next/link";

import {
    formatArticleDisplayDate,
    isArticleAvailableForPublication,
} from "@/entities/article/lib";
import type { ArticleWithRelations } from "@/entities/article/model";
import { cn } from "@/shared/lib/cn";
import PencilIcon from "@icons/pencil.svg";
import ImagePlaceholderIcon from "@icons/image-placeholder.svg";

interface AdminArticleGridItemProps {
    article: ArticleWithRelations;
}

export const AdminArticleGridItem = ({
    article,
}: AdminArticleGridItemProps) => {
    const editHref = `/admin/redactor/article/${article.slug}`;
    const isAvailable = isArticleAvailableForPublication(
        article.isPublished,
        article.publishedAt,
    );
    const statusText = article.isPublished
        ? isAvailable
            ? "Published"
            : "Scheduled"
        : "Draft";
    const tagList = article.tags.map((tag) => `#${tag.name}`).join(" / ");

    return (
        <article className="flex items-center gap-4 rounded-2xl border-slate-200 bg-white p-4 sm:gap-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 sm:h-20 sm:w-32 dark:bg-slate-800">
                {article.previewImg ? (
                    <Image
                        src={article.previewImg}
                        alt={article.title}
                        width={128}
                        height={80}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImagePlaceholderIcon className="size-15 text-slate-400" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-base leading-tight font-bold text-slate-950 sm:text-xl dark:text-white">
                    {article.title}
                </h2>

                <p className="mt-1 text-xs leading-tight text-slate-400 sm:text-sm">
                    {article.author.name} - {formatArticleDisplayDate(article)}
                </p>

                <p className="mt-1 line-clamp-1 text-xs leading-tight text-slate-500 sm:text-sm dark:text-slate-400">
                    {tagList || "Без тем"}
                </p>

                <p
                    className={cn(
                        "mt-1 text-sm leading-tight sm:text-lg",
                        isAvailable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : article.isPublished
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-pink-600 dark:text-pink-400",
                    )}
                >
                    {statusText}
                </p>
            </div>

            <Link
                href={editHref}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:size-11 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                aria-label={`Редактировать статью «${article.title}»`}
            >
                <PencilIcon />
            </Link>
        </article>
    );
};
