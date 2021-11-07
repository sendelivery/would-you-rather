import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Question {
  message: string;
  answer0: string;
  votes0: number;
  answer1: string;
  votes1: number;
  author: string;
}

export const data = new SlashCommandBuilder()
  .setName("wyr")
  .setDescription("Selects a question from Would You Rather's database!");

export const execute = async (interaction: CommandInteraction) => {
  const count = await prisma.question.count();

  const question = await prisma.question.findUnique({
    where: {
      id: Math.floor(Math.random() * count) + 1,
    },
  });

  if (question) {
    await interaction.reply(`Would you rather ${question.message}?`);
  } else {
    await interaction.reply(`Could not find question of matching id ${count}.`);
  }
};
