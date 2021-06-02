-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'ADDED', 'PAUSED', 'WONTADD');

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "views" INTEGER,
    "viewers" INTEGER,
    "title" TEXT,
    "language" TEXT,
    "status" "QueueStatus" NOT NULL DEFAULT E'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queue.twitchId_unique" ON "Queue"("twitchId");
