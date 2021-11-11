/*
  Warnings:

  - You are about to drop the column `id` on the `Interaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commandId]` on the table `Interaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commandId` to the `Interaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Interaction_id_key";

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "id",
ADD COLUMN     "commandId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_commandId_key" ON "Interaction"("commandId");
