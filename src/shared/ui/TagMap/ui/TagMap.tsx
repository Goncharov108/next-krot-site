"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag } from "@/entities/tag";

interface TagMapProps {
    initialTags?: Tag[];
    onClick?: () => void;
}

/**
 * Отображает список рубрик (тегов) с поддержкой SSR-предзагрузки (`initialTags`) и клиентского фолбэка.
 */
export const TagMap = ({ initialTags, onClick }: TagMapProps) => {
    const [tags, setTags] = useState<Tag[]>(initialTags ?? []);
    const [isLoading, setIsLoading] = useState(initialTags === undefined);

    useEffect(() => {
        if (initialTags !== undefined) {
            setTags(initialTags);
            setIsLoading(false);
            return;
        }

        const fetchTags = async () => {
            try {
                const response = await fetch("/api/tags");

                if (!response.ok) {
                    throw new Error("Failed to fetch tags");
                }

                const data: Tag[] = await response.json();

                setTags(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTags();
    }, [initialTags]);

    if (isLoading) {
        return <div className="text-sm opacity-60">Загрузка тем...</div>;
    }

    if (!tags.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
                <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="rounded-full bg-slate-300 px-4 py-2 text-sm whitespace-nowrap"
                    onClick={onClick}
                >
                    {tag.name}
                </Link>
            ))}
        </div>
    );
};
