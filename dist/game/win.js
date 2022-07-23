"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWin = void 0;
const embeds_1 = __importDefault(require("../constants/embeds"));
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const helpers_1 = require("../utils/helpers");
const embeds_2 = __importDefault(require("../embeds"));
const startWaitingRoom_1 = __importDefault(require("./startWaitingRoom"));
// Globals
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
const { imageDir, hootSettings } = settings_1.default;
const { hootOnWin } = hootSettings;
const handleWin = async (player, winByTimeout) => {
    __1.game.active = false;
    // Increment score and hoot of winning player
    const winningUser = (await database_service_1.collections.users.findOne({
        _id: player.userId,
    }));
    // Update user stats
    const currentHoot = winningUser.hoot ? winningUser.hoot : 0;
    const updatedHoot = currentHoot + hootOnWin;
    const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1;
    const updatedAssets = updateAsset(winningUser);
    await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, {
        $set: { yaoWins: updatedScore, hoot: updatedHoot, assets: updatedAssets },
    });
    const playerArr = Object.values(__1.game.players);
    (0, helpers_1.resetGame)();
    (0, helpers_1.emptyDir)(imageDir);
    setAssetTimeout(playerArr);
    await __1.game.arena.edit((0, embeds_2.default)(embeds_1.default.win, { winByTimeout, player }));
    // Add new waiting room
    (0, startWaitingRoom_1.default)();
};
exports.handleWin = handleWin;
const setAssetTimeout = async (players) => {
    // For each player set Asset timeout on user
    await (0, helpers_1.asyncForEach)(players, async (player) => {
        const { userId, asset } = player;
        const { assetId } = asset;
        const { assetCooldown } = settings_1.default;
        const coolDownDoneDate = Date.now() + assetCooldown * 60000;
        const user = await database_service_1.collections.users.findOne({ _id: userId });
        await database_service_1.collections.users.findOneAndUpdate({ _id: userId }, {
            $set: {
                coolDowns: Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.coolDowns), { [assetId]: coolDownDoneDate }),
            },
        });
    });
};
const updateAsset = (winningUser) => {
    const winnerAssets = winningUser.assets;
    const winningAsset = __1.game.players[winningUser.discordId].asset;
    const winningAssetWins = winningAsset.wins ? winningAsset.wins + 1 : 1;
    const updatedAsset = Object.assign(Object.assign({}, winningAsset), { wins: winningAssetWins });
    return Object.assign(Object.assign({}, winnerAssets), { [updatedAsset.assetId]: updatedAsset });
};
