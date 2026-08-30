"use client";

import Link from "next/link";

import { cn } from "@/shared/lib/cn";

import { LikeButton } from "./LikeButton";

interface ReadMoreArticle {
    id: number;
    slug: string;
    likesCount: number;
}

interface ReadMoreProps {
    article: ReadMoreArticle;
    showArticleLink?: boolean;
}

export const ReadMore = ({
    article,
    showArticleLink = true,
}: ReadMoreProps) => {
    return (
        <div className={showArticleLink ? "flex-between" : "flex justify-end"}>
            {showArticleLink && (
                <Link
                    href={`/article/${article.slug}`}
                    className={cn(
                        "xs:px-15 xs:py-4 inline-block rounded-full bg-gray-900 px-5 py-3 text-xs text-white transition hover:bg-gray-700 sm:px-20 dark:bg-white dark:text-black",
                    )}
                >
                    Читать далее
                </Link>
            )}

            <LikeButton article={article} />
        </div>
    );
};
