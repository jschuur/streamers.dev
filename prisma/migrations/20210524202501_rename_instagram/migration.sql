/*
  Warnings:

  - You are about to drop the column `insatgram` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User"
RENAME COLUMN "insatgram" TO "instagram"