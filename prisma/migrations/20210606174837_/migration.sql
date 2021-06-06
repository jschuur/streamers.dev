/*
  Warnings:

  - The values [PEAKPERCENTAGE_NONCODING,TRACKEDUSERS] on the enum `SnapshotType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SnapshotType_new" AS ENUM ('PEAKVIEWERS', 'PEAKVIEWERS_CODING', 'PEAKVIEWERS_NONCODING', 'PEAKPERCENTAGE_VIEWERS_NONCODING', 'PEAKCHANNELS', 'PEAKCHANNELS_CODING', 'PEAKCHANNELS_NONCODING', 'PEAKPERCENTAGE_CHANNELS_NONCODING', 'TRACKEDCHANNELS');
ALTER TABLE "Snapshot" ALTER COLUMN "type" TYPE "SnapshotType_new" USING ("type"::text::"SnapshotType_new");
ALTER TYPE "SnapshotType" RENAME TO "SnapshotType_old";
ALTER TYPE "SnapshotType_new" RENAME TO "SnapshotType";
DROP TYPE "SnapshotType_old";
COMMIT;
