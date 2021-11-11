/*
  Warnings:

  - You are about to drop the `Interaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interactor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InteractorsOnInteractions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_questionId_fkey";

-- DropForeignKey
ALTER TABLE "InteractorsOnInteractions" DROP CONSTRAINT "InteractorsOnInteractions_interactionId_fkey";

-- DropForeignKey
ALTER TABLE "InteractorsOnInteractions" DROP CONSTRAINT "InteractorsOnInteractions_userId_fkey";

-- DropTable
DROP TABLE "Interaction";

-- DropTable
DROP TABLE "Interactor";

-- DropTable
DROP TABLE "InteractorsOnInteractions";

-- CreateTable
CREATE TABLE "interaction" (
    "id" SERIAL NOT NULL,
    "commandId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "votes0" INTEGER NOT NULL,
    "votes1" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactor" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "interactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InteractionToInteractor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "interaction_commandId_key" ON "interaction"("commandId");

-- CreateIndex
CREATE UNIQUE INDEX "interactor_userId_key" ON "interactor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_InteractionToInteractor_AB_unique" ON "_InteractionToInteractor"("A", "B");

-- CreateIndex
CREATE INDEX "_InteractionToInteractor_B_index" ON "_InteractionToInteractor"("B");

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InteractionToInteractor" ADD FOREIGN KEY ("A") REFERENCES "interaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InteractionToInteractor" ADD FOREIGN KEY ("B") REFERENCES "interactor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
