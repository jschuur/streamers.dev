-- CreateEnum
CREATE TYPE "StreamType" AS ENUM ('CODING', 'GAMEDEV', 'INFOSEC', 'CHATTING', 'OTHER', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "streamType" "StreamType"[];
