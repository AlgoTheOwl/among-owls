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
const handleWin = async (player, winByTimeout, channel) => {
    const { id: channelId } = channel;
    const game = __1.games[channelId];
    const { imageDir, hootSettings, assetCooldown } = await (0, settings_1.getSettings)(channelId);
    const { hootOnWin } = hootSettings;
    game.active = false;
    // Increment score and hoot of winning player
    const winningUser = (await database_service_1.collections.users.findOne({
        _id: player.userId,
    }));
    const attachment = new discord_js_1.AttachmentBuilder('src/images/death.gif', {
        name: 'death.gif',
    });
    await game.megatron.edit({
        files: [attachment],
    });
    // Update user stats
    const currentHoot = winningUser.hoot ? winningUser.hoot : 0;
    const updatedHoot = currentHoot + hootOnWin;
    const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1;
    const updatedAssets = updateAsset(winningUser, game.players);
    await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, {
        $set: { yaoWins: updatedScore, hoot: updatedHoot, assets: updatedAssets },
    });
    const playerArr = Object.values(game.players);
    (0, helpers_1.resetGame)(false, channelId);
    (0, settings_1.clearSettings)(channelId);
    (0, helpers_1.emptyDir)(imageDir);
    setAssetTimeout(playerArr, assetCooldown);
    await (0, helpers_1.wait)(2000);
    await game.arena.edit((0, embeds_2.default)(embeds_1.default.win, channelId, { winByTimeout, player, hootOnWin }));
    // Add new waiting room
    (0, _1.startWaitingRoom)(channel);
};
exports.handleWin = handleWin;
const setAssetTimeout = async (players, assetCooldown) => {
    // For each player set Asset timeout on user
    await (0, helpers_1.asyncForEach)(players, async (player) => {
        const { userId, asset } = player;
        const { assetId } = asset;
        const coolDownDoneDate = Date.now() + assetCooldown * 60000;
        const user = await database_service_1.collections.users.findOne({ _id: userId });
        await database_service_1.collections.users.findOneAndUpdate({ _id: userId }, {
            $set: {
                coolDowns: Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.coolDowns), { [assetId]: coolDownDoneDate }),
            },
        });
    });
};
const updateAsset = (winningUser, players) => {
    const winnerAssets = winningUser.assets;
    const winningAsset = players[winningUser.discordId].asset;
    const winningAssetWins = winningAsset.wins ? winningAsset.wins + 1 : 1;
    const updatedAsset = Object.assign(Object.assign({}, winningAsset), { wins: winningAssetWins });
    return Object.assign(Object.assign({}, winnerAssets), { [updatedAsset.assetId]: updatedAsset });
};
