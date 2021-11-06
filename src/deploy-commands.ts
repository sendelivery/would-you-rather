import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { magenta, yellow } from "chalk";
import { commands } from ".";

export const registerCommands = () => {
  if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.error(magenta("Required environment variables are not set"));
    process.exit(1);
  }

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

  rest
    .put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands.map((command) => command.data.toJSON()) }
    )
    .then(() => console.log(yellow("Successfully registered application commands.")))
    .catch(console.error);
};
