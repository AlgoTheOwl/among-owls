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
    var _a, _b;
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
                try {
                    const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.name === 'registered');
                    const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === id);
                    role && (await (member === null || member === void 0 ? void 0 : member.roles.add(role.id)));
                }
                catch (error) {
                    console.log('ERROR adding role', error);
                }
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
            const { status, registeredUser } = await (0, register_1.processRegistration)(user, true);
            if (registeredUser)
                console.log(`test user ${i + 1} added`);
            else
                console.log(status);
        });
        await interaction.reply({
            content: 'all test users added',
        });
    }
});
client.login(token);
