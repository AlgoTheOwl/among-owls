"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickPlayerInterval = exports.emojis = exports.game = void 0;
const discord_js_1 = require("discord.js");
const helpers_1 = require("./utils/helpers");
const database_service_1 = require("./database/database.service");
const attack_1 = __importDefault(require("./interactions/attack"));
const embeds_1 = __importDefault(require("./embeds"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const settings_1 = __importDefault(require("./settings"));
const game_1 = __importDefault(require("./models/game"));
const token = process.env.DISCORD_TOKEN;
const { hp, kickPlayerTimeout, coolDownInterval } = settings_1.default;
// Gloval vars
exports.game = new game_1.default({}, false, false, coolDownInterval);
exports.emojis = {};
// Settings
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
    ],
});
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
client.once('ready', async () => {
    await (0, database_service_1.connectToDatabase)();
    console.log('Ye Among AOWLs - Server ready');
    // load emojis into gamej
});
/*
 *****************
 * COMMAND SERVER *
 *****************
 */
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
    if (interaction.isSelectMenu()) {
        try {
            if (interaction.customId === 'attack') {
                const { user } = interaction;
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
        }
        catch (error) {
            console.log(error);
        }
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
    exports.kickPlayerInterval = setInterval(async () => {
        if (exports.game.active) {
            (0, helpers_1.getPlayerArray)(exports.game.players).forEach((player) => {
                if (!player.rolledRecently) {
                    exports.game.players[player.discordId].timedOut = true;
                }
            });
            const playerArr = (0, helpers_1.getPlayerArray)(exports.game.players);
            const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
            if (winningPlayer && exports.game.active) {
                clearInterval(exports.kickPlayerInterval);
                return (0, helpers_1.handleWin)(winningPlayer, interaction, winByTimeout);
            }
            const usersTimedOut = playerArr.filter((player) => player.timedOut);
            if (playerArr.length === usersTimedOut.length) {
                const embedData = {
                    image: undefined,
                    title: 'BOOOO!!!',
                    description: 'Game has ended due to all players being removed for inactivity',
                };
                exports.game.embed.edit((0, embeds_1.default)(embedData));
                exports.game.active = false;
                return clearInterval(exports.kickPlayerInterval);
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
