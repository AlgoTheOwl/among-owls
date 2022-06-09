"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const game_1 = __importDefault(require("../models/game"));
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_2 = require("../utils/helpers");
const __1 = require("..");
const player_1 = __importDefault(require("../models/player"));
const database_service_1 = require("../database/database.service");
async function startGame(interaction, hp, imageDir) {
    try {
        if (!interaction.isCommand())
            return;
        if (__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) {
            return await interaction.reply({
                content: 'A game is already running',
                ephemeral: true,
            });
        }
        const players = (await database_service_1.collections.yaoPlayers
            .find({})
            .toArray());
        if (players.length < 2) {
            return await interaction.reply({
                content: 'There are not enough players to start the game',
                ephemeral: true,
            });
        }
        await interaction.deferReply();
        const gamePlayers = {};
        // empty image directory
        (0, helpers_1.emptyDir)(imageDir);
        await (0, helpers_1.asyncForEach)(players, async (player) => {
            const { username, discordId, address, asset, userId } = player;
            // save each image locally for use later
            const localPath = await (0, helpers_1.downloadFile)(asset, imageDir, username);
            if (localPath) {
                const assetWithLocalPath = Object.assign(Object.assign({}, asset), { localPath });
                gamePlayers[discordId] = new player_1.default(username, discordId, address, assetWithLocalPath, userId, hp, 0);
            }
            else {
                // error downloading
                await interaction.reply({
                    content: 'Error downloading assets from the blockchain, please try again',
                    ephemeral: true,
                });
            }
        });
        const playerArr = Object.values(gamePlayers);
        // instansiate new game
        const game = new game_1.default(gamePlayers, true, false, 1000);
        // send back game embed
        const embedData = {
            image: undefined,
            fields: (0, helpers_2.mapPlayersForEmbed)(playerArr),
            description: 'Leaderboard',
        };
        const file = new discord_js_1.MessageAttachment('src/images/main.gif');
        // send embed here
        await interaction.editReply({ files: [file] });
        game.embed = await interaction.followUp((0, embeds_1.default)(embedData));
        return game;
    }
    catch (error) {
        //@ts-ignore
        interaction.reply({
            content: 'Error starting game - sometimes requests time out here - try starting the game again',
            ephemeral: true,
        });
    }
}
exports.default = startGame;
