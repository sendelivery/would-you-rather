import { Client } from "discord.js";
import fs from "fs";
import path from "path";
import { cyan } from "chalk";
import { commands } from "..";
import { registerCommands } from "../deploy-commands";

module.exports = {
  name: "ready",
  once: "true",
  async execute(client: Client<true>) {
    console.log(cyan(`Ready! Logged in as ${client.user.tag}`));

    const commandFiles = fs // if null check
      .readdirSync(path.resolve(__dirname, "../commands/"))
      .filter((file) =>
        file.endsWith(process.env.NODE_ENV === "dev" ? ".ts" : ".js")
      );

    for (const file in commandFiles) {
      const command = await import(
        path.resolve(__dirname, "../commands/", commandFiles[file])
      );
      commands.set(command.data.name, command);
    }

    registerCommands();
  },
};
