"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.creatorAddressArr = exports.emojis = exports.games = void 0;
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
const helpers_1 = require("./utils/helpers");
const token = process.env.DISCORD_TOKEN;
const creatorAddressOne = process.env.CREATOR_ADDRESS_ONE;
const creatorAddressTwo = process.env.CREATOR_ADDRESS_TWO;
const creatorAddressThree = process.env.CREATOR_ADDRESS_THREE;
// Gloval vars
exports.games = {};
exports.emojis = {};
exports.creatorAddressArr = [
    creatorAddressOne,
    creatorAddressTwo,
    creatorAddressThree,
];
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildEmojisAndStickers,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
    ],
});
exports.client.once('ready', async () => {
    try {
        main();
    }
    catch (error) {
        console.log('****** CLIENT ERROR ******', error);
        (0, helpers_1.wait)(3000);
        main();
    }
});
const main = async () => {
    await (0, database_service_1.connectToDatabase)();
    console.log('Ye Among AOWLs - Server ready');
    let update = true;
    if (!node_fs_1.default.existsSync('dist/txnData/txnData.json')) {
        update = false;
        node_fs_1.default.writeFileSync('dist/txnData/txnData.json', '');
    }
    const txnData = await (0, algorand_1.convergeTxnData)(exports.creatorAddressArr, update);
    node_fs_1.default.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData));
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
    const channelIdArr = Object.keys(settings_1.default);
    // start game for each channel
    (0, helpers_1.asyncForEach)(channelIdArr, async (channelId) => {
        if (settings_1.default[channelId]) {
            const channel = exports.client.channels.cache.get(channelId);
            const { maxCapacity } = settings_1.default[channelId];
            exports.games[channelId] = new game_1.default({}, false, false, maxCapacity, channelId);
            (0, game_2.startWaitingRoom)(channel);
        }
        else {
            console.log(`missing settings for channel ${channelId}`);
        }
    });
};
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
exports.client.on('interactionCreate', async (interaction) => {
    try {
        let command;
        if (interaction.isCommand()) {
            command = exports.client.commands.get(interaction.commandName);
        }
        if (interaction.isSelectMenu() || interaction.isButton()) {
            command = exports.client.commands.get(interaction.customId);
        }
        if (!command)
            return;
        await command.execute(interaction);
    }
    catch (error) {
        console.log('****** INTERACTION ERROR ******');
    }
});
exports.client.login(token);
