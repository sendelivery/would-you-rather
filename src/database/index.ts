import { PrismaClient } from "@prisma/client";
import { MessageComponentInteraction } from "discord.js";

const prisma = new PrismaClient();

export const getQuestionById = async (id: number) =>
  await prisma.question.findUnique({
    where: {
      id: id,
    },
  });

export const getInteractor = async (commandId: string, userId: string) =>
  await prisma.interaction
    .findUnique({
      where: {
        commandId: commandId,
      },
    })
    .interactors({
      where: {
        userId: userId,
      },
    });

interface IVotes0 {
  votes0: {
    increment: number;
  };
}

interface IVotes1 {
  votes1: {
    increment: number;
  };
}

export const incrementVote = async (
  interaction: MessageComponentInteraction,
  votes: IVotes0 | IVotes1,
  id: number
) => {
  return await prisma.interaction.update({
    where: {
      id: id,
    },
    data: {
      ...votes,
      interactors: {
        connectOrCreate: {
          where: {
            userId: interaction.user.id,
          },
          create: {
            userId: interaction.user.id,
          },
        },
      },
    },
  });
};
