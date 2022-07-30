"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.creatorAddressArr = exports.channel = exports.emojis = exports.game = void 0;
// Discord
const discord_js_1 = require("discord.js");
// Node
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Helpers
const database_service_1 = require("./database/database.service");
// Globals
const settings_1 = __importDefault(require("./settings"));
// Schema
const game_1 = __importDefault(require("./models/game"));
// Helpers
const game_2 = require("./game");
const algorand_1 = require("./utils/algorand");
const token = process.env.DISCORD_TOKEN;
const creatorAddressOne = process.env.CREATOR_ADDRESS_ONE;
const creatorAddressTwo = process.env.CREATOR_ADDRESS_TWO;
const creatorAddressThree = process.env.CREATOR_ADDRESS_THREE;
const { coolDownInterval, channelId } = settings_1.default;
// Gloval vars
exports.game = new game_1.default({}, false, false, coolDownInterval);
exports.emojis = {};
exports.creatorAddressArr = [
    creatorAddressOne,
    creatorAddressTwo,
    creatorAddressThree,
];
exports.client = new discord_js_1.Client({
    restRequestTimeout: 60000,
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
    ],
});
exports.client.once('ready', async () => {
    try {
        await (0, database_service_1.connectToDatabase)();
        console.log('Ye Among AOWLs - Server ready');
        if (!node_fs_1.default.existsSync(__dirname + '/txnData/txnData.json')) {
            console.log('does not exist');
            node_fs_1.default.writeFileSync(__dirname + '/txnData/txnData.json', '');
        }
        const txnData = await (0, algorand_1.convergeTxnData)(exports.creatorAddressArr, false);
        node_fs_1.default.writeFileSync('src/txnData/txnData.json', JSON.stringify(txnData));
        exports.channel = exports.client.channels.cache.get(channelId);
        exports.client.commands = new discord_js_1.Collection();
        const commandsPath = node_path_1.default.join(__dirname, 'commands');
        const commandFiles = node_fs_1.default
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = node_path_1.default.join(commandsPath, file);
            const command = require(filePath);
            exports.client.commands.set(command.data.name, command);
        }
        await (0, game_2.startWaitingRoom)();
    }
    catch (error) {
        console.log('CLIENT ERROR', error);
    }
});
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
exports.client.on('interactionCreate', async (interaction) => {
    let command;
    if (interaction.isCommand()) {
        // ensure two games can't start simultaneously
        if (((exports.game === null || exports.game === void 0 ? void 0 : exports.game.active) || (exports.game === null || exports.game === void 0 ? void 0 : exports.game.waitingRoom)) &&
            interaction.commandName === 'start') {
            return await interaction.reply({
                content: 'A game is already running',
                ephemeral: true,
            });
        }
        command = exports.client.commands.get(interaction.commandName);
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
        command = exports.client.commands.get(interaction.customId);
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
// process.on('uncaughtException', (err) => {
//   console.log('uncaught exception error')
//   console.log(err)
// })
exports.client.login(token);
