"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWin = void 0;
// Discord
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../constants/embeds"));
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const helpers_1 = require("../utils/helpers");
const embeds_2 = __importDefault(require("../embeds"));
const _1 = require(".");
// Globals
const __1 = require("..");
const settings_1 = require("../utils/settings");
const encounter_1 = __importDefault(require("../models/encounter"));
/**
 * Handle game state when win occurs
 * @param player
 * @param channel
 */
const handleWin = async (player, channel) => {
    const { id: channelId } = channel;
    const game = __1.games[channelId];
    const { imageDir, hootSettings, assetCooldown } = await (0, settings_1.getSettings)(channelId);
    const { hootOnWin } = hootSettings;
    game.active = false;
    player.win = true;
    // Increment score and hoot of winning player
    const winningUser = (await database_service_1.collections.users.findOne({
        discordId: player.discordId,
    }));
    // Render death imagery
    const attachment = new discord_js_1.AttachmentBuilder('src/images/death.gif', {
        name: 'death.gif',
    });
    await game.megatron.edit({
        files: [attachment],
    });
    const playerArr = Object.values(game.players);
    // Save encounter
    addEncounter(game, winningUser._id, player.asset.assetId, channelId);
    // Reset state for new game
    endGameMutation(playerArr, assetCooldown, hootOnWin);
    (0, helpers_1.resetGame)(false, channelId);
    (0, settings_1.clearSettings)(channelId);
    (0, helpers_1.emptyDir)(imageDir);
    // Wait a couple of seconds before rendering winning embed
    await (0, helpers_1.wait)(2000);
    await game.arena.edit((0, embeds_2.default)(embeds_1.default.win, channelId, { player, hootOnWin }));
    // Add new waiting room
    (0, _1.startWaitingRoom)(channel);
};
exports.handleWin = handleWin;
/**
 * Update user state in accordance with game result
 * @param players
 * @param assetCooldown
 * @param hootOnWin
 */
const endGameMutation = async (players, assetCooldown, hootOnWin) => {
    await (0, helpers_1.asyncForEach)(players, async (player) => {
        const { asset, win, kos, discordId } = player;
        const assetId = asset.assetId.toString();
        const coolDownDoneDate = Date.now() + assetCooldown * 60000;
        const user = (await database_service_1.collections.users.findOne({
            discordId,
        }));
        // Provide fallbacks for null values
        const userYaoWins = user.yaoWins || 0;
        const userYaoLosses = user.yaoLosses || 0;
        const userYaoKos = user.yaoKos || 0;
        // Increment values
        const yaoLosses = win ? user.yaoLosses : userYaoLosses + 1;
        const yaoWins = win ? userYaoWins + 1 : userYaoWins;
        const yaoKos = win ? userYaoKos + kos : userYaoKos;
        const wins = win ? asset.wins + 1 : asset.wins;
        const losses = win ? asset.losses : asset.losses + 1;
        const hoot = win ? user.hoot + hootOnWin : user.hoot;
        const updatedAsset = Object.assign(Object.assign({}, asset), { wins,
            losses, kos: asset.kos });
        // Add cooldowns, update user asset
        const userData = Object.assign(Object.assign({}, user), { coolDowns: Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.coolDowns), { [assetId]: coolDownDoneDate }), assets: Object.assign(Object.assign({}, user.assets), { [assetId]: updatedAsset }), hoot,
            yaoWins,
            yaoLosses,
            yaoKos });
        await database_service_1.collections.users.findOneAndReplace({ discordId }, userData);
    });
};
/**
 * Adds encounter to database
 * @param game
 * @param winnerId
 * @param winningAssetId
 * @param channelId
 */
const addEncounter = (game, winnerId, winningAssetId, channelId) => {
    const encounter = new encounter_1.default(game.players, game.rounds, winnerId, winningAssetId, game.startTime, Date.now(), channelId);
    database_service_1.collections.encounters.insertOne(encounter);
};
