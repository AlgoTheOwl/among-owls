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
const start_1 = __importDefault(require("./interactions/start"));
const attack_1 = __importDefault(require("./interactions/attack"));
const roles_1 = require("./constants/roles");
const database_service_2 = require("./database/database.service");
const embeds_1 = __importDefault(require("./embeds"));
const token = process.env.DISCORD_TOKEN;
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
        const gameState = await (0, start_1.default)(interaction, hp, imageDir);
        if (gameState) {
            exports.game = gameState;
            await handlePlayerTimeout(interaction);
        }
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
            return interaction.reply({
                content: 'Game is not currently running',
                ephemeral: true,
            });
        exports.game.active = false;
        await clearInterval(kickPlayerInterval);
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    }
    if (commandName === 'register') {
        // TODO: add ability to register for different games here
        const address = options.getString('address');
        const assetId = options.getNumber('assetid');
        const { username, id } = user;
        if (address && assetId) {
            const { status, registeredUser, asset } = await (0, register_1.processRegistration)(username, id, address, assetId, 'yao', hp);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, roles_1.DISCORD_ROLES.registered, registeredUser);
            }
            await interaction.reply({ ephemeral: true, content: status });
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
    //   if (commandName === 'test-register') {
    //     await asyncForEach(mockUsers, async (user: User, i: number) => {
    //       const { status, registeredUser, asset } = await processRegistration(
    //         user,
    //         true
    //       )
    //       if (registeredUser && asset) {
    //         addRole(interaction, DISCORD_ROLES.registered, registeredUser)
    //       } else {
    //         console.log('status:', status)
    //       }
    //     })
    //     await interaction.reply({
    //       content: 'all test users added',
    //       ephemeral: true,
    //     })
    //   }
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
    console.log('already past wait');
    kickPlayerInterval = setInterval(async () => {
        if (exports.game.active) {
            (0, helpers_1.getPlayerArray)(exports.game.players).forEach((player) => {
                if (!player.rolledRecently) {
                    exports.game === null || exports.game === void 0 ? true : delete exports.game.players[player.discordId];
                }
            });
            const playerArr = (0, helpers_1.getPlayerArray)(exports.game.players);
            if (playerArr.length === 1) {
                return (0, helpers_1.handleWin)(playerArr, interaction);
            }
            if (playerArr.length) {
                const embedData = {
                    fields: (0, helpers_1.mapPlayersForEmbed)((0, helpers_1.getPlayerArray)(exports.game.players)),
                    image: undefined,
                };
                return exports.game.embed.edit((0, embeds_1.default)(embedData));
            }
            const embedData = {
                image: undefined,
                title: 'BOOOO',
                description: 'Game has ended due to all players being removed for inactivity',
            };
            exports.game.embed.edit((0, embeds_1.default)(embedData));
            exports.game.active = false;
            clearInterval(kickPlayerInterval);
        }
    }, kickPlayerTimeout);
};
client.login(token);
