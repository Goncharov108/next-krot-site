import Image from "next/image";

import { Article } from "@/entities/article";
import { cn } from "@/shared/lib/cn";
import { ParsedHTML, sanitizeArticleHtml } from "@/shared/lib/html-react-parser";

import defaultImg from "@images/mockImg.png";

interface ArticleBodyProps {
    article: Article;
    isExpanded: boolean;
}

/**
 * Отображает обложку, заголовок и очищенное тело статьи.
 */
export const ArticleBody = ({ article, isExpanded }: ArticleBodyProps) => {
    const TitleTag = isExpanded ? "h1" : "h2";
    const cleanMainText = sanitizeArticleHtml(article.mainText);

    return (
        <>
            <Image
                src={article.previewImg ?? defaultImg}
                alt={article.title}
                height={200}
                width={404}
                className="h-80 w-full rounded-xl object-cover"
            />

            <div>
                <TitleTag
                    className={cn(
                        "text-h3 mb-6 text-2xl font-bold text-black md:text-3xl dark:text-white",
                    )}
                >
                    {article.title}
                </TitleTag>

                <div className="relative text-black dark:text-white">
                    <div
                        className={cn(
                            "article__main-content space-y-2 overflow-hidden text-base leading-7 transition-[max-height] duration-500 ease-in-out md:text-lg md:leading-8",
                            isExpanded ? "max-h-full" : "max-h-30 md:max-h-50",
                        )}
                    >
                        <ParsedHTML html={cleanMainText} />
                    </div>

                    {!isExpanded && (
                        <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-linear-to-t from-white to-transparent dark:from-gray-900" />
                    )}
                </div>
            </div>
        </>
    );
};
