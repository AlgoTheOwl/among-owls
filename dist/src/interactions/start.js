"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const operations_1 = require("../database/operations");
const user_1 = __importDefault(require("../models/user"));
const game_1 = __importDefault(require("../models/game"));
const helpers_1 = require("../utils/helpers");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_2 = require("../utils/helpers");
async function startGame(interaction, hp, imageDir) {
    if (!interaction.isCommand())
        return;
    const players = await (0, operations_1.fetchPlayers)();
    if (!players.length) {
        return await interaction.reply({
            content: 'There are not enough players to start the game',
            ephemeral: true,
        });
    }
    await interaction.deferReply();
    const gamePlayers = {};
    await (0, helpers_1.asyncForEach)(players, async (player) => {
        const { username, discordId, address, asset } = player;
        // save each image locally for use later
        const localPath = await (0, helpers_1.downloadFile)(asset, imageDir, username);
        if (localPath) {
            const assetWithLocalPath = Object.assign(Object.assign({}, asset), { localPath });
            gamePlayers[discordId] = new user_1.default(username, discordId, address, assetWithLocalPath, hp, 0);
        }
        else {
            // error downloading
            await interaction.reply({
                content: 'Error downloading asset from the blockchain',
                ephemeral: true,
            });
        }
    });
    const playerArr = Object.values(gamePlayers);
    // instansiate new game
    const game = new game_1.default(gamePlayers, true, false, 1000);
    // send back game embed
    const embedData = {
        fields: (0, helpers_2.mapPlayersForEmbed)(playerArr),
    };
    game.embed = await interaction.editReply((0, embeds_1.default)(embedData));
    return game;
}
exports.default = startGame;
