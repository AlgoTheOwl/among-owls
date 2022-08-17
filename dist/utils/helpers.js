"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfRegisteredPlayer = exports.updateGame = exports.normalizeIpfsUrl = exports.isIpfs = exports.getUsersFromPlayers = exports.doDamage = exports.resetGame = exports.randomSort = exports.getWinningPlayer = exports.randomNumber = exports.getPlayerArray = exports.getNumberSuffix = exports.confirmRole = exports.removeRole = exports.addRole = exports.emptyDir = exports.mapPlayersForEmbed = exports.downloadFile = exports.asyncForEach = exports.wait = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const embeds_1 = __importDefault(require("../embeds"));
const __1 = require("..");
const embeds_2 = __importDefault(require("../constants/embeds"));
const database_service_1 = require("../database/database.service");
const wait = async (duration) => {
    await new Promise((res) => {
        setTimeout(res, duration);
    });
};
exports.wait = wait;
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};
exports.asyncForEach = asyncForEach;
const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/';
const downloadFile = async (asset, directory, username) => {
    try {
        const { assetUrl } = asset;
        if (assetUrl) {
            const url = (0, exports.normalizeIpfsUrl)(assetUrl);
            const path = `${directory}/${username
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .trim()}.jpg`;
            const writer = fs_1.default.createWriteStream(path);
            const res = await axios_1.default.get(url, {
                responseType: 'stream',
            });
            res.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    return resolve(path);
                });
                writer.on('error', (err) => console.log(err));
            });
        }
    }
    catch (error) {
        console.log('ERROR:', error);
    }
};
exports.downloadFile = downloadFile;
const mapPlayersForEmbed = (playerArr, type) => playerArr.map((player) => {
    let value;
    if (player.dead || player.hp <= 0) {
        value = '💀';
    }
    else {
        value =
            type === 'game'
                ? `HP: ${player.hp}`
                : `${player.asset.alias || player.asset.assetName}`;
    }
    return {
        name: player.username,
        value,
    };
});
exports.mapPlayersForEmbed = mapPlayersForEmbed;
const emptyDir = (dirPath) => {
    try {
        const dirContents = fs_1.default.readdirSync(dirPath);
        dirContents.forEach((filePath) => {
            const fullPath = path_1.default.join(dirPath, filePath);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                if (fs_1.default.readdirSync(fullPath).length)
                    (0, exports.emptyDir)(fullPath);
                fs_1.default.rmdirSync(fullPath);
            }
            else
                fs_1.default.unlinkSync(fullPath);
        });
    }
    catch (error) {
        console.log('Error deleting contents of image directory', error);
    }
};
exports.emptyDir = emptyDir;
const addRole = async (interaction, roleId, user) => {
    var _a, _b;
    try {
        const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.id === roleId);
        const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === user.discordId);
        role && (await (member === null || member === void 0 ? void 0 : member.roles.add(role.id)));
    }
    catch (error) {
        console.log('Error adding role', error);
    }
};
exports.addRole = addRole;
const removeRole = async (interaction, roleId, discordId) => {
    var _a, _b;
    const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.id === roleId);
    const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === discordId);
    role && (await (member === null || member === void 0 ? void 0 : member.roles.remove(role.id)));
};
exports.removeRole = removeRole;
const confirmRole = async (roleId, interaction, userId) => {
    var _a;
    const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find((member) => member.id === userId);
    return member === null || member === void 0 ? void 0 : member.roles.cache.has(roleId);
};
exports.confirmRole = confirmRole;
const getNumberSuffix = (num) => {
    if (num === 1)
        return '1st';
    if (num === 2)
        return '2nd';
    if (num === 3)
        return '3rd';
    else
        return `${num}th`;
};
exports.getNumberSuffix = getNumberSuffix;
const getPlayerArray = (players) => Object.values(players);
exports.getPlayerArray = getPlayerArray;
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);
exports.randomNumber = randomNumber;
const getWinningPlayer = (playerArr) => {
    const activePlayers = playerArr.filter((player) => !player.timedOut && !player.dead);
    let winByTimeout = false;
    const timedOutPlayers = playerArr.filter((player) => player.timedOut);
    if (timedOutPlayers.length === playerArr.length - 1) {
        winByTimeout = true;
    }
    return activePlayers.length === 1
        ? { winningPlayer: activePlayers[0], winByTimeout }
        : { winningPlayer: undefined, winByTimeout: false };
};
exports.getWinningPlayer = getWinningPlayer;
const randomSort = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const k = arr[i];
        arr[i] = arr[j];
        arr[j] = k;
    }
    return arr;
};
exports.randomSort = randomSort;
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
const doDamage = (player, withMultiplier = false, damagePerAowl, damageRange) => {
    if (withMultiplier) {
        const { assetMultiplier } = player;
        const multiplierDamage = (assetMultiplier >= 20 ? 20 : assetMultiplier) * damagePerAowl;
        return Math.floor(Math.random() * damageRange) + multiplierDamage;
    }
    else {
        return Math.floor(Math.random() * damageRange);
    }
};
exports.doDamage = doDamage;
const getUsersFromPlayers = async (players) => {
    const users = [];
    await (0, exports.asyncForEach)(players, async (player) => {
        const user = (await database_service_1.collections.users.findOne({
            discordId: player.discordId,
        }));
        users.push(user);
    });
    return users;
};
exports.getUsersFromPlayers = getUsersFromPlayers;
const isIpfs = (url) => (url === null || url === void 0 ? void 0 : url.slice(0, 4)) === 'ipfs';
exports.isIpfs = isIpfs;
const normalizeIpfsUrl = (url) => {
    if ((0, exports.isIpfs)(url)) {
        const ifpsHash = url.slice(7);
        return `${ipfsGateway}${ifpsHash}`;
    }
    else {
        return url;
    }
};
exports.normalizeIpfsUrl = normalizeIpfsUrl;
const updateGame = (channelId) => {
    const game = __1.games[channelId];
    game.update = true;
    setTimeout(() => {
        game.update = false;
    }, 3000);
};
exports.updateGame = updateGame;
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
