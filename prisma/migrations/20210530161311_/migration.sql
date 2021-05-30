/*
  Warnings:

  - A unique constraint covering the columns `[type,timeStamp]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Snapshot.type_timeStamp_unique" ON "Snapshot"("type", "timeStamp");
