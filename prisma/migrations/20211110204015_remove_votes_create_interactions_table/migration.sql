/*
  Warnings:

  - You are about to drop the column `votes0` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `votes1` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "votes0",
DROP COLUMN "votes1";

-- CreateTable
CREATE TABLE "Interaction" (
    "id" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "votes0" INTEGER NOT NULL,
    "votes1" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_id_key" ON "Interaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_questionId_key" ON "Interaction"("questionId");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
