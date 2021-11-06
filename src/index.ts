import { Client, Collection, Intents } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "fs";
import path from "path";
require("dotenv").config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

export const commands: Collection<
  string,
  { execute: Function; data: SlashCommandBuilder }
> = new Collection();

// try catch
const eventFiles = fs
  .readdirSync(path.resolve(__dirname, "events/"))
  .filter((file) => file.endsWith(process.env.NODE_ENV === "dev" ? ".ts" : ".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => {
      event.execute(...args);
    });
  }
}

client.login(process.env.TOKEN);
