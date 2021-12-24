-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "latestStreamTwitchId" TEXT;

-- CreateTable
CREATE TABLE "Stream" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "twitchStreamId" TEXT NOT NULL,
    "isCoding" BOOLEAN NOT NULL DEFAULT false,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "viewers" INTEGER,
    "peakViewers" INTEGER,
    "language" TEXT,
    "currentGameName" TEXT,
    "allGameNames" TEXT[],
    "currentTags" TEXT[],
    "allTags" TEXT[],
    "currentTwitchTags" TEXT[],
    "allTwitchTags" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastOnline" TIMESTAMP(3),

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stream_twitchStreamId_key" ON "Stream"("twitchStreamId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
