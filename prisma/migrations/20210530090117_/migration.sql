-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('USER', 'BRAND', 'SHOW', 'COLLABORATION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "channelType" "ChannelType" NOT NULL DEFAULT E'USER';
