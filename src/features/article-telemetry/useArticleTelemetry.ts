"use client";

import { useEffect, useRef } from "react";
import { trackYandexGoal } from "@/app/analytics/lib/trackYandexGoal";

interface UseArticleTelemetryOptions {
    articleId: number;
    isFullArticle: boolean;
}

const sendTelemetryEvent = (payload: Record<string, unknown>) => {
    try {
        const body = JSON.stringify(payload);
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            const blob = new Blob([body], { type: "application/json" });
            navigator.sendBeacon("/api/telemetry", blob);
            return;
        }
        void fetch("/api/telemetry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
        });
    } catch {
        // Игнорируем сетевые ошибки телеметрии на клиенте
    }
};

/**
 * Клиентский хук авто-трекинга статьи: фиксирует показы в ленте, открытие, глубину дочитывания (25-100%),
 * активное время чтения во вкладке и переходы по ссылкам внутри текста, дублируя цели в Яндекс.Метрику.
 */
export const useArticleTelemetry = ({
    articleId,
    isFullArticle,
}: UseArticleTelemetryOptions) => {
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element || !articleId) return;

        // 1. Трекинг показа превью в ленте (Impression)
        if (!isFullArticle) {
            let timer: ReturnType<typeof setTimeout> | null = null;
            let tracked = false;

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry?.isIntersecting && !tracked) {
                        timer = setTimeout(() => {
                            tracked = true;
                            sendTelemetryEvent({
                                articleId,
                                event: "impression",
                            });
                        }, 900);
                    } else if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                },
                { threshold: 0.5 },
            );

            observer.observe(element);
            return () => {
                if (timer) clearTimeout(timer);
                observer.disconnect();
            };
        }

        // 2. Трекинг полного открытия статьи, глубины скролла, времени и кликов
        sendTelemetryEvent({ articleId, event: "open" });
        trackYandexGoal("article_open");

        const milestones = new Set<number>();
        let activeTimeSec = 0;
        let isTabActive = !document.hidden;
        let lastActivityAt = Date.now();
        let sessionSent = false;

        const markActivity = () => {
            lastActivityAt = Date.now();
        };

        const handleVisibilityChange = () => {
            isTabActive = !document.hidden;
            if (isTabActive) {
                lastActivityAt = Date.now();
            }
        };

        const activeInterval = setInterval(() => {
            if (isTabActive && Date.now() - lastActivityAt < 25_000) {
                activeTimeSec += 1;
            }
        }, 1000);

        const handleScroll = () => {
            markActivity();
            const contentEl =
                element.querySelector<HTMLElement>(".article__main-content") ??
                element;
            const rect = contentEl.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const totalHeight = Math.max(1, rect.height);
            const viewedPx = Math.min(
                totalHeight,
                Math.max(0, viewportHeight - rect.top),
            );
            const ratio = (viewedPx / totalHeight) * 100;

            const thresholds: Array<{
                pct: number;
                event: "scroll25" | "scroll50" | "scroll75" | "scroll100";
                ymGoal?: string;
            }> = [
                { pct: 25, event: "scroll25" },
                { pct: 50, event: "scroll50", ymGoal: "article_read_50" },
                { pct: 75, event: "scroll75" },
                { pct: 100, event: "scroll100", ymGoal: "article_read_100" },
            ];

            for (const item of thresholds) {
                if (ratio >= item.pct && !milestones.has(item.pct)) {
                    milestones.add(item.pct);
                    sendTelemetryEvent({ articleId, event: item.event });
                    if (item.ymGoal) {
                        trackYandexGoal(item.ymGoal);
                    }
                }
            }
        };

        const handleClick = (event: MouseEvent) => {
            markActivity();
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#")) return;

            const isExternal =
                href.startsWith("http") &&
                !href.includes(window.location.hostname);

            sendTelemetryEvent({
                articleId,
                event: "link_click",
                targetUrl: href,
                anchorText: (anchor.textContent || href).trim().slice(0, 140),
                isExternal,
            });

            if (isExternal) {
                trackYandexGoal("article_outbound_click");
            } else {
                trackYandexGoal("article_internal_click");
            }
        };

        const flushSession = () => {
            if (sessionSent) return;
            sessionSent = true;
            sendTelemetryEvent({
                articleId,
                event: "reading_session",
                activeTimeSec,
                isBounce: activeTimeSec < 15 && !milestones.has(25),
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("mousemove", markActivity, { passive: true });
        window.addEventListener("keydown", markActivity, { passive: true });
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pagehide", flushSession);
        element.addEventListener("click", handleClick);

        // Первичный замер на случай короткой статьи
        handleScroll();

        return () => {
            clearInterval(activeInterval);
            flushSession();
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", markActivity);
            window.removeEventListener("keydown", markActivity);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            window.removeEventListener("pagehide", flushSession);
            element.removeEventListener("click", handleClick);
        };
    }, [articleId, isFullArticle]);

    return containerRef;
};
