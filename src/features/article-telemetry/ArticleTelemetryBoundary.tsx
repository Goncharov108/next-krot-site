"use client";

import { ReactNode } from "react";
import { useArticleTelemetry } from "./useArticleTelemetry";

interface ArticleTelemetryBoundaryProps {
    articleId: number;
    isFullArticle: boolean;
    className?: string;
    children: ReactNode;
}

/**
 * Клиентская обёртка карточки/страницы статьи, подключающая авто-трекинг показов, скролла, времени чтения и кликов по ссылкам.
 */
export const ArticleTelemetryBoundary = ({
    articleId,
    isFullArticle,
    className,
    children,
}: ArticleTelemetryBoundaryProps) => {
    const ref = useArticleTelemetry({ articleId, isFullArticle });

    return (
        <article ref={ref} className={className}>
            {children}
        </article>
    );
};
