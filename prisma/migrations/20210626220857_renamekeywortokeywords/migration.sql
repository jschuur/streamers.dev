/*
  Warnings:

  - You are about to drop the column `keyword` on the `Keyword` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Keyword" DROP COLUMN "keyword",
ADD COLUMN     "keywords" TEXT[];
