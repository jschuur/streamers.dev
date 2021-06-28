-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "keyword" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword.id_unique" ON "Keyword"("id");
