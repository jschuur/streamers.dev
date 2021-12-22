-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Channel" RENAME CONSTRAINT "User_pkey" TO "Channel_pkey";

-- AlterTable
ALTER TABLE "User" RENAME CONSTRAINT "User_pkey1" TO "User_pkey";

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Account.providerId_providerAccountId_unique" RENAME TO "Account_providerId_providerAccountId_key";

-- RenameIndex
ALTER INDEX "Channel.displayName_unique" RENAME TO "Channel_displayName_key";

-- RenameIndex
ALTER INDEX "Channel.name_unique" RENAME TO "Channel_name_key";

-- RenameIndex
ALTER INDEX "Channel.twitchId_unique" RENAME TO "Channel_twitchId_key";

-- RenameIndex
ALTER INDEX "Keyword.id_unique" RENAME TO "Keyword_id_key";

-- RenameIndex
ALTER INDEX "Queue.twitchId_unique" RENAME TO "Queue_twitchId_key";

-- RenameIndex
ALTER INDEX "Session.accessToken_unique" RENAME TO "Session_accessToken_key";

-- RenameIndex
ALTER INDEX "Session.sessionToken_unique" RENAME TO "Session_sessionToken_key";

-- RenameIndex
ALTER INDEX "Snapshot.timeStamp_unique" RENAME TO "Snapshot_timeStamp_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "VerificationRequest.identifier_token_unique" RENAME TO "VerificationRequest_identifier_token_key";

-- RenameIndex
ALTER INDEX "VerificationRequest.token_unique" RENAME TO "VerificationRequest_token_key";
