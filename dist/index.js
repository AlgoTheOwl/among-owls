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
const database_service_2 = require("./database/database.service");
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
/**
 * Listener for server start
 */
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
/**
 * Main game function
 * Connects to db, fetches txnData from blockchain and starts games in specified channels
 */
const main = async () => {
    await (0, database_service_1.connectToDatabase)();
    await setupTxns();
    setupCommands();
    startGames();
    console.log('Ye Among AOWLs - Server ready');
};
/**
 * Checks if we have a txnData file, creates one if not
 * Fetches and reduces txnData from all creator wallets and writes file
 */
const setupTxns = async () => {
    let update = true;
    if (!node_fs_1.default.existsSync('dist/txnData/txnData.json')) {
        update = false;
        node_fs_1.default.writeFileSync('dist/txnData/txnData.json', '');
    }
    const txnData = await (0, algorand_1.convergeTxnData)(exports.creatorAddressArr, update);
    node_fs_1.default.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData));
};
/**
 * Parses command files and readies them for use in client
 */
const setupCommands = () => {
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
};
/**
 * Fetches channel settings from DB
 * Starts game for each object entered
 */
const startGames = async () => {
    const channelSettings = (await database_service_2.collections.settings
        .find({})
        .toArray());
    (0, helpers_1.asyncForEach)(channelSettings, async (settings) => {
        // TODO: Test to make sure each settings object is valid
        const { maxCapacity, channelId } = settings;
        const channel = exports.client.channels.cache.get(channelId);
        exports.games[channelId] = new game_1.default({}, false, false, maxCapacity, 0, Date.now());
        (0, game_2.startWaitingRoom)(channel);
    });
};
/**
 * Main command listener
 */
exports.client.on('interactionCreate', async (interaction) => {
    try {
        let command;
        if (interaction.type === discord_js_1.InteractionType.ApplicationCommand) {
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
        console.log('****** INTERACTION ERROR ******', error);
    }
});
exports.client.login(token);
