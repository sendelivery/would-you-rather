"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = require("discord.js");
require("dotenv").config();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS] });
exports.commands = new discord_js_1.Collection();
const commandFiles = fs_1.default
    .readdirSync("./src/commands")
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    exports.commands.set(command.data.name, command);
}
const eventFiles = fs_1.default
    .readdirSync("./src/events")
    .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => {
            event.execute(...args);
        });
    }
}
client.login(process.env.TOKEN);
//# sourceMappingURL=index.js.map