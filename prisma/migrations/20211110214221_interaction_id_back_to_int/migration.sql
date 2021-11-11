/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Interaction` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `Interaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_id_key" ON "Interaction"("id");
