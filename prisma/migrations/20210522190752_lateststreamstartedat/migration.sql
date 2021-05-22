/*
  Warnings:

  - You are about to drop the column `lastOnline` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastOnline",
ADD COLUMN     "latestStreamStartedAt" TIMESTAMP(3);
