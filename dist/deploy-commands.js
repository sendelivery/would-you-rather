"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const chalk_1 = require("chalk");
const _1 = require(".");
const registerCommands = () => {
    if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
        console.error((0, chalk_1.magenta)("Required environment variables are not set"));
        process.exit(1);
    }
    const rest = new rest_1.REST({ version: "9" }).setToken(process.env.TOKEN);
    rest
        .put(v9_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: _1.commands.map((command) => command.data.toJSON()) })
        .then(() => console.log((0, chalk_1.yellow)("Successfully registered application commands.")))
        .catch(console.error);
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=deploy-commands.js.map