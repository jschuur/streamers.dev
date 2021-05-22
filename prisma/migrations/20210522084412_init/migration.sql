-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "fullName" TEXT,
    "description" TEXT NOT NULL,
    "country" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "topics" TEXT[],
    "type" TEXT,
    "broadcasterType" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL,
    "profilePictureUrl" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "lastOnline" TIMESTAMP(3),
    "homepage" TEXT,
    "youtube" TEXT,
    "twitter" TEXT,
    "github" TEXT,
    "discord" TEXT,
    "insatgram" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.twitchId_unique" ON "User"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "User.name_unique" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User.displayName_unique" ON "User"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "User.profilePictureUrl_unique" ON "User"("profilePictureUrl");
