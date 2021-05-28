-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latestStreamGameName" TEXT,
ADD COLUMN     "latestStreamIsMature" BOOLEAN,
ADD COLUMN     "latestStreamLanguage" TEXT;
