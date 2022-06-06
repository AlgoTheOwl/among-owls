"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emojis = exports.game = void 0;
const discord_js_1 = require("discord.js");
const helpers_1 = require("./utils/helpers");
const register_1 = require("./interactions/register");
const database_service_1 = require("./database/database.service");
const game_1 = __importDefault(require("./models/game"));
const users_1 = __importDefault(require("./mocks/users"));
const start_1 = __importDefault(require("./interactions/start"));
const attack_1 = __importDefault(require("./interactions/attack"));
const database_service_2 = require("./database/database.service");
const embeds_1 = __importDefault(require("./embeds"));
const token = process.env.DISCORD_TOKEN;
const roleId = process.env.ADMIN_ID;
// Gloval vars
exports.game = new game_1.default({}, false, false, 0);
exports.emojis = {};
// Settings
const hp = 1000;
const imageDir = 'dist/nftAssets';
let kickPlayerInterval;
const kickPlayerTimeout = 2000;
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
    ],
});
client.once('ready', async () => {
    await (0, database_service_1.connectToDatabase)();
    console.log('Ye Among AOWLs - Server ready');
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
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        const gameState = await (0, start_1.default)(interaction, hp, imageDir);
        if (gameState) {
            exports.game = gameState;
        }
    }
    if (commandName === 'attack') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply({
                content: `HOO do you think you are? The game hasn’t started yet!`,
                ephemeral: true,
            });
        if (!exports.game.attackEngaged) {
            handlePlayerTimeout(interaction);
            exports.game.attackEngaged = true;
        }
        (0, attack_1.default)(interaction, exports.game, user, hp);
    }
    if (commandName === 'stop') {
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active))
            return interaction.reply({
                content: 'Game is not currently running',
                ephemeral: true,
            });
        exports.game.active = false;
        await clearInterval(kickPlayerInterval);
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    }
    if (commandName === 'register') {
        if (!(exports.game === null || exports.game === void 0 ? void 0 : exports.game.active)) {
            return interaction.reply({
                content: 'Please wait until after the game ends to register',
                ephemeral: true,
            });
        }
        // TODO: add ability to register for different games here
        const address = options.getString('address');
        const assetId = options.getNumber('assetid');
        const { username, id } = user;
        if (address && assetId) {
            const { status, registeredUser, asset } = await (0, register_1.processRegistration)(username, id, address, assetId, 'yao', hp);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, process.env.REGISTERED_ID, registeredUser);
            }
            await interaction.reply({
                ephemeral: registeredUser ? false : true,
                content: status,
            });
        }
    }
    if (commandName === 'leaderboard') {
        const winningUsers = (await database_service_2.collections.users
            .find({ yaoWins: { $gt: 0 } })
            .sort({ yaoWins: 'desc' })
            .toArray());
        if (winningUsers.length) {
            const embedData = {
                title: 'Leaderboard',
                description: 'Which AOWLs rule them all?',
                image: undefined,
                fields: winningUsers.map((user, i) => {
                    const place = i + 1;
                    const win = user.yaoWins === 1 ? 'win' : 'wins';
                    return {
                        name: `#${place}: ${user.username}`,
                        value: `${user.yaoWins} ${win}`,
                    };
                }),
            };
            await interaction.reply((0, embeds_1.default)(embedData));
        }
    }
    /*
     *****************
     * TEST COMMANDS *
     *****************
     */
    // test registring and selecting players
    if (commandName === 'test-register') {
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        await (0, helpers_1.asyncForEach)(users_1.default, async (player, i) => {
            const { username, discordId, address, assetId } = player;
            await (0, register_1.processRegistration)(username, discordId, address, assetId, 'yao', hp);
        });
        await interaction.reply({
            content: 'all test users added',
            ephemeral: true,
        });
    }
});
/*
 *****************
 **** HELPERS ****
 *****************
 */
const handlePlayerTimeout = async (interaction) => {
    if (!interaction.isCommand())
        return;
    await (0, helpers_1.wait)(20000);
    kickPlayerInterval = setInterval(async () => {
        if (exports.game.active) {
            (0, helpers_1.getPlayerArray)(exports.game.players).forEach((player) => {
                if (!player.rolledRecently) {
                    // delete game?.players[player.discordId]
                    exports.game.players[player.discordId].timedOut = true;
                }
            });
            const playerArr = (0, helpers_1.getPlayerArray)(exports.game.players);
            const winningPlayer = (0, helpers_1.getWinningPlayer)(playerArr);
            if (winningPlayer && exports.game.active) {
                clearInterval(kickPlayerInterval);
                return (0, helpers_1.handleWin)(winningPlayer, interaction);
            }
            const usersTimedOut = playerArr.filter((player) => player.timedOut);
            if (!playerArr.length || playerArr.length === usersTimedOut.length) {
                const embedData = {
                    image: undefined,
                    title: 'BOOOO!!!',
                    description: 'Game has ended due to all players being removed for inactivity',
                };
                exports.game.embed.edit((0, embeds_1.default)(embedData));
                exports.game.active = false;
                return clearInterval(kickPlayerInterval);
            }
            if (playerArr.length) {
                const embedData = {
                    fields: (0, helpers_1.mapPlayersForEmbed)((0, helpers_1.getPlayerArray)(exports.game.players)),
                    image: undefined,
                };
                return exports.game.embed.edit((0, embeds_1.default)(embedData));
            }
        }
    }, kickPlayerTimeout);
};
client.login(token);
