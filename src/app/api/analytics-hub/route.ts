import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = async () => {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
};

/**
 * Выгружает статьи, накопленные метрики, клики по ссылкам, авторов, теги и элементы контент-плана для analytics-studio.
 */
export const GET = async () => {
    try {
        const [articles, authors, tags, contentPlanItems] = await Promise.all([
            prisma.article.findMany({
                include: {
                    author: true,
                    tags: true,
                    dailyMetrics: {
                        orderBy: { date: "asc" },
                    },
                    linkClicks: {
                        orderBy: { clicksCount: "desc" },
                    },
                },
                orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
            }),
            prisma.author.findMany(),
            prisma.tag.findMany(),
            prisma.contentPlanItem.findMany({
                include: {
                    author: true,
                    article: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            isPublished: true,
                            publishedAt: true,
                        },
                    },
                },
                orderBy: [{ plannedDate: "asc" }, { updatedAt: "desc" }],
            }),
        ]);

        return NextResponse.json(
            {
                ok: true,
                source: "postgres",
                articles,
                authors,
                tags,
                contentPlanItems,
            },
            { headers: corsHeaders },
        );
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                source: "unavailable",
                error:
                    error instanceof Error
                        ? error.message
                        : "Database connection unavailable",
            },
            { status: 503, headers: corsHeaders },
        );
    }
};

/**
 * Создает или обновляет элемент контент-плана в PostgreSQL.
 */
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const item = await prisma.contentPlanItem.upsert({
            where: {
                id: body.id ? Number(body.id) : -1,
            },
            update: {
                title: body.title,
                slug: body.slug ?? null,
                stage: body.stage,
                priority: body.priority,
                plannedDate: body.plannedDate
                    ? new Date(body.plannedDate)
                    : null,
                targetWordCount: Number(body.targetWordCount ?? 1500),
                currentWords: Number(body.currentWords ?? 0),
                notes: body.notes ?? "",
                targetOpenRate: body.targetOpenRate
                    ? Number(body.targetOpenRate)
                    : null,
                targetReadRate: body.targetReadRate
                    ? Number(body.targetReadRate)
                    : null,
                authorId: body.authorId ? Number(body.authorId) : null,
                tagIds: Array.isArray(body.tagIds)
                    ? body.tagIds.map(Number)
                    : [],
            },
            create: {
                title: body.title,
                slug: body.slug ?? null,
                stage: body.stage ?? "IDEA",
                priority: body.priority ?? "MEDIUM",
                plannedDate: body.plannedDate
                    ? new Date(body.plannedDate)
                    : null,
                targetWordCount: Number(body.targetWordCount ?? 1500),
                currentWords: Number(body.currentWords ?? 0),
                notes: body.notes ?? "",
                targetOpenRate: body.targetOpenRate
                    ? Number(body.targetOpenRate)
                    : null,
                targetReadRate: body.targetReadRate
                    ? Number(body.targetReadRate)
                    : null,
                authorId: body.authorId ? Number(body.authorId) : null,
                tagIds: Array.isArray(body.tagIds)
                    ? body.tagIds.map(Number)
                    : [],
            },
        });

        return NextResponse.json({ ok: true, item }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to save content plan item",
            },
            { status: 500, headers: corsHeaders },
        );
    }
};
