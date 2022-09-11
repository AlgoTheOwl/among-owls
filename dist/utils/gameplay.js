"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfRegisteredPlayer = exports.updateGame = exports.getUsersFromPlayers = exports.resetGame = exports.getWinningPlayer = void 0;
const __1 = require("..");
const embeds_1 = __importDefault(require("../embeds"));
const database_service_1 = require("../database/database.service");
const embeds_2 = __importDefault(require("../constants/embeds"));
const helpers_1 = require("./helpers");
/**
 * Fetches winning player or returns undefined
 * @param playerArr
 * @returns {Player | undefined}
 */
const getWinningPlayer = (playerArr) => {
    const activePlayers = playerArr.filter((player) => !player.dead);
    return activePlayers.length === 1 ? activePlayers[0] : undefined;
};
exports.getWinningPlayer = getWinningPlayer;
/**
 * Resets game state for a specified channel
 * Sends "stopped" embed if game is actively stopped
 * @param stopped
 * @param channelId
 */
const resetGame = (stopped = false, channelId) => {
    var _a;
    const game = __1.games[channelId];
    game.players = {};
    game.active = false;
    game.win = false;
    game.waitingRoom = false;
    game.attackEngaged = false;
    game.stopped = false;
    game.megatron = undefined;
    if (stopped) {
        game.stopped = true;
        stopped && ((_a = game === null || game === void 0 ? void 0 : game.embed) === null || _a === void 0 ? void 0 : _a.edit((0, embeds_1.default)(embeds_2.default.stopped, channelId)));
    }
};
exports.resetGame = resetGame;
/**
 * Returns a user db entry for every registered player
 * @param players
 * @returns {Promise<User[]>}
 */
const getUsersFromPlayers = async (players) => {
    const users = [];
    await (0, helpers_1.asyncForEach)(players, async (player) => {
        const user = (await database_service_1.collections.users.findOne({
            discordId: player.discordId,
        }));
        users.push(user);
    });
    return users;
};
exports.getUsersFromPlayers = getUsersFromPlayers;
/**
 * Toggles the update flag in the game state on for 3 seconds
 * Loop watching game will "notice" this and update
 * @param channelId
 */
const updateGame = (channelId) => {
    const game = __1.games[channelId];
    game.update = true;
    setTimeout(() => {
        game.update = false;
    }, 3000);
};
exports.updateGame = updateGame;
/**
 * Checks all games to see if specific asset is registered in one
 * Used to limit players from entering multiple games
 * @param games
 * @param assetId
 * @param discordId
 * @returns {Boolean}
 */
const checkIfRegisteredPlayer = (games, assetId, discordId) => {
    let gameCount = 0;
    const gameArray = Object.values(games);
    gameArray.forEach((game) => {
        var _a, _b;
        if (((_b = (_a = game.players[discordId]) === null || _a === void 0 ? void 0 : _a.asset) === null || _b === void 0 ? void 0 : _b.assetId) === Number(assetId))
            gameCount++;
    });
    return gameCount >= 1;
};
exports.checkIfRegisteredPlayer = checkIfRegisteredPlayer;
