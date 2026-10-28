import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

interface TelemetryPayload {
    articleId: number;
    event:
        | "impression"
        | "open"
        | "scroll25"
        | "scroll50"
        | "scroll75"
        | "scroll100"
        | "reading_session"
        | "link_click"
        | "share";
    activeTimeSec?: number;
    isBounce?: boolean;
    targetUrl?: string;
    anchorText?: string;
    isExternal?: boolean;
}

const getTodayUtcDate = () => {
    const now = new Date();
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
};

/**
 * Принимает события телеметрии чтения статей (показы в ленте, открытия, скролл 25-100%, активное время, клики по ссылкам).
 */
export const POST = async (request: NextRequest) => {
    try {
        const body = (await request.json()) as TelemetryPayload;
        const articleId = Number(body.articleId);

        if (!articleId || Number.isNaN(articleId) || !body.event) {
            return NextResponse.json(
                { ok: false, error: "Invalid telemetry payload" },
                { status: 400 },
            );
        }

        const date = getTodayUtcDate();

        if (body.event === "link_click" && body.targetUrl) {
            await prisma.articleLinkClick.upsert({
                where: {
                    articleId_targetUrl: {
                        articleId,
                        targetUrl: body.targetUrl,
                    },
                },
                update: {
                    clicksCount: { increment: 1 },
                    anchorText: body.anchorText || body.targetUrl,
                },
                create: {
                    articleId,
                    targetUrl: body.targetUrl,
                    anchorText: body.anchorText || body.targetUrl,
                    isExternal: body.isExternal ?? true,
                    clicksCount: 1,
                },
            });

            return NextResponse.json({ ok: true });
        }

        const increments: Record<string, { increment: number }> = {};

        switch (body.event) {
            case "impression":
                increments.impressions = { increment: 1 };
                break;
            case "open":
                increments.opens = { increment: 1 };
                break;
            case "scroll25":
                increments.scroll25 = { increment: 1 };
                break;
            case "scroll50":
                increments.scroll50 = { increment: 1 };
                break;
            case "scroll75":
                increments.scroll75 = { increment: 1 };
                break;
            case "scroll100":
                increments.scroll100 = { increment: 1 };
                break;
            case "share":
                increments.sharesCount = { increment: 1 };
                break;
            case "reading_session": {
                const sec = Math.max(
                    0,
                    Math.min(3600, Math.round(body.activeTimeSec ?? 0)),
                );
                if (sec > 0) {
                    increments.totalActiveTimeSec = { increment: sec };
                }
                if (body.isBounce) {
                    increments.bouncesCount = { increment: 1 };
                } else if (sec >= 15) {
                    increments.engagedSessions = { increment: 1 };
                }
                break;
            }
        }

        await prisma.articleMetricDaily.upsert({
            where: {
                articleId_date: {
                    articleId,
                    date,
                },
            },
            update: increments,
            create: {
                articleId,
                date,
                impressions: body.event === "impression" ? 1 : 0,
                opens: body.event === "open" ? 1 : 0,
                scroll25: body.event === "scroll25" ? 1 : 0,
                scroll50: body.event === "scroll50" ? 1 : 0,
                scroll75: body.event === "scroll75" ? 1 : 0,
                scroll100: body.event === "scroll100" ? 1 : 0,
                sharesCount: body.event === "share" ? 1 : 0,
                totalActiveTimeSec:
                    body.event === "reading_session"
                        ? Math.max(0, Math.round(body.activeTimeSec ?? 0))
                        : 0,
                engagedSessions:
                    body.event === "reading_session" &&
                    !body.isBounce &&
                    (body.activeTimeSec ?? 0) >= 15
                        ? 1
                        : 0,
                bouncesCount:
                    body.event === "reading_session" && body.isBounce ? 1 : 0,
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.warn("Telemetry write skipped:", error);
        return NextResponse.json({ ok: false, skipped: true }, { status: 202 });
    }
};
