/*
  Warnings:

  - You are about to drop the column `type` on the `Snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Snapshot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[timeStamp]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Snapshot.type_timeStamp_unique";

-- AlterTable
ALTER TABLE "Snapshot" DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "peakLiveCodingChannels" INTEGER,
ADD COLUMN     "peakLiveCodingViewers" INTEGER,
ADD COLUMN     "totalLiveChannels" INTEGER,
ADD COLUMN     "totalLiveViewers" INTEGER,
ADD COLUMN     "trackedChannels" INTEGER;

-- DropEnum
DROP TYPE "SnapshotType";

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot.timeStamp_unique" ON "Snapshot"("timeStamp");
