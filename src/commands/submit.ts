import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const data = new SlashCommandBuilder()
  .setName("submit")
  .setDescription("Submit a question to Would You Rather's database.")
  .addStringOption((option) =>
    option
      .setName("answer1")
      .setDescription("Write something down for answer 1")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("answer2")
      .setDescription("Now something else for answer 2")
      .setRequired(true)
  );

export const execute = async (interaction: CommandInteraction) => {
  const ans0 = interaction.options.getString("answer1", true).toLowerCase();
  const ans1 = interaction.options.getString("answer2", true).toLowerCase();

  const newQuestion = await prisma.question.create({
    data: {
      message: `**${ans0}** or **${ans1}**`,
      author: interaction.user.id,
    },
  });

  await prisma.answer.createMany({
    data: [
      {
        text: ans0,
        first: true,
        questionId: newQuestion.id,
      },
      {
        text: ans1,
        questionId: newQuestion.id,
      },
    ],
  });

  console.log(newQuestion, " success!");

  await interaction.reply({
    content: `You submitted: Would you rather ${newQuestion.message}?`,
    ephemeral: true,
  });
};
