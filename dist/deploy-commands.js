"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();
const registerCommands = () => {
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    rest
        .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: _1.commands.map((command) => command.data.toJSON()) })
        .then(() => console.log("Successfully registered application commands."))
        .catch(console.error);
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=deploy-commands.js.map