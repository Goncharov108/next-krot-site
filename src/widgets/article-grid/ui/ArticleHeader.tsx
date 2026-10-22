import { Article } from "@/entities/article";
import { formatArticleDisplayDate } from "@/entities/article/lib";
import { Author } from "@/entities/author";
import Image from "next/image";
import DefaultAvatarImg from "@icons/default-avatar.svg";
import { Tag } from "@/entities/tag";
import Link from "next/link";

interface ArticleCardProps {
    article: Article;
    author: Author;
    tags: Tag[];
}

export const ArticleHeader = ({ article, author, tags }: ArticleCardProps) => {
    return (
        <div className="md:flex-between block space-y-3 text-xs md:space-y-0">
            <Link
                href={`/author/${author.slug}`}
                className="flex items-center gap-3"
            >
                {author.avatarImg ? (
                    <Image
                        src={author.avatarImg}
                        alt={author.name}
                        width={50}
                        height={50}
                        className="rounded-full"
                    />
                ) : (
                    <DefaultAvatarImg alt={author.name} />
                )}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500">
                        {formatArticleDisplayDate(article)}
                    </span>
                    <span className="font-semibold text-black dark:text-white">
                        {author.name}
                    </span>
                </div>
            </Link>
            <div className="flex flex-col gap-1">
                <span className="text-gray-500">Время чтения</span>
                <span className="text-black dark:text-white">
                    ~ {article.readingTime ?? 7} мин
                </span>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Темы</span>

                    <span className="flex gap-1 text-nowrap text-black dark:text-white">
                        {tags.map((tag, index) => (
                            <Link key={tag.id} href={`/tag/${tag.slug}`}>
                                #{tag.name}
                                {index !== tags.length - 1 && " / "}
                            </Link>
                        ))}
                    </span>
                </div>
            )}
        </div>
    );
};
