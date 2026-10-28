-- CreateEnum
CREATE TYPE "ContentPlanStage" AS ENUM ('IDEA', 'DRAFTING', 'REVIEW', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ContentPlanPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "ArticleMetricDaily" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "scroll25" INTEGER NOT NULL DEFAULT 0,
    "scroll50" INTEGER NOT NULL DEFAULT 0,
    "scroll75" INTEGER NOT NULL DEFAULT 0,
    "scroll100" INTEGER NOT NULL DEFAULT 0,
    "totalActiveTimeSec" INTEGER NOT NULL DEFAULT 0,
    "engagedSessions" INTEGER NOT NULL DEFAULT 0,
    "sharesCount" INTEGER NOT NULL DEFAULT 0,
    "bouncesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleMetricDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleLinkClick" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT true,
    "clicksCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleLinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPlanItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "stage" "ContentPlanStage" NOT NULL DEFAULT 'IDEA',
    "priority" "ContentPlanPriority" NOT NULL DEFAULT 'MEDIUM',
    "plannedDate" TIMESTAMP(3),
    "targetWordCount" INTEGER NOT NULL DEFAULT 1500,
    "currentWords" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "targetOpenRate" DOUBLE PRECISION,
    "targetReadRate" DOUBLE PRECISION,
    "articleId" INTEGER,
    "authorId" INTEGER,
    "tagIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleMetricDaily_articleId_date_key" ON "ArticleMetricDaily"("articleId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLinkClick_articleId_targetUrl_key" ON "ArticleLinkClick"("articleId", "targetUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPlanItem_articleId_key" ON "ContentPlanItem"("articleId");

-- AddForeignKey
ALTER TABLE "ArticleMetricDaily" ADD CONSTRAINT "ArticleMetricDaily_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleLinkClick" ADD CONSTRAINT "ArticleLinkClick_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlanItem" ADD CONSTRAINT "ContentPlanItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlanItem" ADD CONSTRAINT "ContentPlanItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;
