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
  .setName("submit")
  .setDescription("Submit a question to Would You Rather's database :9")
  .addStringOption((option) =>
    option
      .setName("answer1")
      .setDescription("Write something down for answer 1")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("answer2")
      .setDescription("Now a different one for answer 2")
      .setRequired(true)
  );

export const execute = async (interaction: CommandInteraction) => {
  const ans0 = interaction.options.getString("answer1", true);
  const ans1 = interaction.options.getString("answer2", true);

  const question: Question = {
    message: `**${ans0}** or **${ans1}**`,
    answer0: ans0,
    votes0: 0,
    answer1: ans1,
    votes1: 0,
    author: interaction.user.tag
  };

  console.log(`Submitting ${question.message}...`);

  const newQuestion = await prisma.question.create({
    data: question,
  });

  console.log(newQuestion, " success!");

  await interaction.reply(`<@!${interaction.user.id}> submitted: Would you rather ${question.message}?`);
};
