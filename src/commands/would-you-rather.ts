import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

interface Question {
  question: string,
  votes: {
    answer0: number,
    answer1: number
  }
}

export const data = new SlashCommandBuilder()
  .setName("wyr")
  .setDescription("Selects a question from Would You Rather's database!");

export const execute = async (interaction: CommandInteraction) => {
  const question: string = "Question";
  await interaction.reply(question);
}
