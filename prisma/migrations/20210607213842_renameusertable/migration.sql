-- AlterIndex
ALTER INDEX "User.displayName_unique" RENAME TO "Channel.displayName_unique";

-- AlterIndex
ALTER INDEX "User.name_unique" RENAME TO "Channel.name_unique";

-- AlterIndex
ALTER INDEX "User.twitchId_unique" RENAME TO "Channel.twitchId_unique";
