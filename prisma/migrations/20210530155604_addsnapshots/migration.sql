-- CreateEnum
CREATE TYPE "SnapshotType" AS ENUM ('PEAKVIEWERS');

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" SERIAL NOT NULL,
    "type" "SnapshotType" NOT NULL,
    "value" INTEGER NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);
