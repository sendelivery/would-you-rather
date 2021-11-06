"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { registerCommands } = require('../deploy-commands');
module.exports = {
    name: "ready",
    once: "true",
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        registerCommands();
    },
};
//# sourceMappingURL=ready.js.map