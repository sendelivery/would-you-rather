import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
  .setName("submit")
  .setDescription("Submit a question to Would You Rather's database :9");

export const execute = async (interaction: CommandInteraction) =>
  await interaction.reply("Pong!");
