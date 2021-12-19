/*
  Warnings:

  - You are about to drop the column `answer0` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `answer1` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `votes0` on the `interaction` table. All the data in the column will be lost.
  - You are about to drop the column `votes1` on the `interaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answer0",
DROP COLUMN "answer1";

-- AlterTable
ALTER TABLE "interaction" DROP COLUMN "votes0",
DROP COLUMN "votes1";

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Votes" (
    "id" SERIAL NOT NULL,
    "interactionId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "interaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
