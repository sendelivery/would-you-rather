-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "answer0" TEXT NOT NULL,
    "votes0" INTEGER NOT NULL,
    "answer1" TEXT NOT NULL,
    "votes1" INTEGER NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
