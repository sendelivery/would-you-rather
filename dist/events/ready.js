"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = require("chalk");
const __1 = require("..");
const deploy_commands_1 = require("../deploy-commands");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
module.exports = {
    name: "ready",
    once: "true",
    execute(client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log((0, chalk_1.cyan)(`Ready! Logged in as ${client.user.tag}`));
            const newUser = yield prisma.user.create({
                data: {
                    name: "Alice",
                    email: "alice@prisma.io",
                },
            });
            console.log(newUser);
            const commandFiles = fs_1.default // if null check
                .readdirSync(path_1.default.resolve(__dirname, "../commands/"))
                .filter((file) => file.endsWith(process.env.NODE_ENV === "dev" ? ".ts" : ".js"));
            for (const file in commandFiles) {
                const command = yield Promise.resolve().then(() => __importStar(require(path_1.default.resolve(__dirname, "../commands/", commandFiles[file]))));
                __1.commands.set(command.data.name, command);
            }
            (0, deploy_commands_1.registerCommands)();
        });
    },
};
//# sourceMappingURL=ready.js.map