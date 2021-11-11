-- CreateTable
CREATE TABLE "Interactor" (
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InteractorsOnInteractions" (
    "userId" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,

    CONSTRAINT "InteractorsOnInteractions_pkey" PRIMARY KEY ("userId","interactionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interactor_userId_key" ON "Interactor"("userId");

-- AddForeignKey
ALTER TABLE "InteractorsOnInteractions" ADD CONSTRAINT "InteractorsOnInteractions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Interactor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractorsOnInteractions" ADD CONSTRAINT "InteractorsOnInteractions_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction"("commandId") ON DELETE RESTRICT ON UPDATE CASCADE;
