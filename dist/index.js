"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.intervals = exports.playerTimeouts = exports.emojis = exports.game = void 0;
// Library
const discord_js_1 = require("discord.js");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const database_service_1 = require("./database/database.service");
const settings_1 = __importDefault(require("./settings"));
const game_1 = __importDefault(require("./models/game"));
const token = process.env.DISCORD_TOKEN;
const { coolDownInterval } = settings_1.default;
// Gloval vars
exports.game = new game_1.default({}, false, false, coolDownInterval);
exports.emojis = {};
exports.playerTimeouts = {};
exports.intervals = {
    timeoutInterval: null,
    playerTimeouts: {},
};
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
    ],
});
client.once('ready', async () => {
    await (0, database_service_1.connectToDatabase)();
    console.log('Ye Among AOWLs - Server ready');
    // load emojis into gamej
    client.commands = new discord_js_1.Collection();
    const commandsPath = node_path_1.default.join(__dirname, 'commands');
    const commandFiles = node_fs_1.default
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = node_path_1.default.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }
});
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
client.on('interactionCreate', async (interaction) => {
    let command;
    if (interaction.isCommand()) {
        command = client.commands.get(interaction.commandName);
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
        command = client.commands.get(interaction.customId);
    }
    if (!command)
        return;
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
    }
});
client.on('message', (message) => {
    console.log(message);
});
client.login(token);
