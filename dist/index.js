"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emojis = exports.game = void 0;
const user_1 = __importDefault(require("./models/user"));
const discord_js_1 = require("discord.js");
const helpers_1 = require("./utils/helpers");
const register_1 = require("./interactions/register");
const database_service_1 = require("./database/database.service");
const users_1 = __importDefault(require("./mocks/users"));
const start_1 = __importDefault(require("./interactions/start"));
const attack_1 = __importDefault(require("./interactions/attack"));
const roles_1 = require("./constants/roles");
const token = process.env.DISCORD_TOKEN;
exports.emojis = {};
// Settings
const hp = 1000;
const imageDir = 'dist/images';
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
    ],
});
client.once('ready', async () => {
    await (0, database_service_1.connectToDatabase)();
    console.log('When AOWLS Attack - Server ready');
    // load emojis into game
});
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand())
        return;
    const { commandName, user, options } = interaction;
    if (commandName === 'start') {
        const gameState = await (0, start_1.default)(interaction, hp, imageDir);
        if (gameState)
            exports.game = gameState;
    }
    if (commandName === 'attack') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply({
                content: `The game hasn't started yet, please register if you haven't already and try again later`,
                ephemeral: true,
            });
        (0, attack_1.default)(interaction, exports.game, user, hp);
    }
    if (commandName === 'stop') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply('Game is not currently running');
        exports.game.active = false;
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    }
    if (commandName === 'register') {
        const address = options.getString('address');
        const assetId = options.getNumber('assetid');
        const { username, id } = user;
        if (address && assetId) {
            const registrant = new user_1.default(username, id, address, { assetId }, hp, 0);
            const { status, registeredUser, asset } = await (0, register_1.processRegistration)(registrant, false);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, roles_1.DISCORD_ROLES.registered, registeredUser);
            }
            await interaction.reply({ ephemeral: true, content: status });
        }
    }
    /*
     *****************
     * TEST COMMANDS *
     *****************
     */
    // test registring and selecting players
    if (commandName === 'test-register') {
        await (0, helpers_1.asyncForEach)(users_1.default, async (user, i) => {
            const { status, registeredUser, asset } = await (0, register_1.processRegistration)(user, true);
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, roles_1.DISCORD_ROLES.registered, registeredUser);
            }
            else {
                console.log('status:', status);
            }
        });
        await interaction.reply({
            content: 'all test users added',
            ephemeral: true,
        });
    }
});
client.login(token);
