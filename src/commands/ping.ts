import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
const wait = require('util').promisify(setTimeout);

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply("Pong!");
  await wait(2000);
  await interaction.editReply("Pong again!");
};
