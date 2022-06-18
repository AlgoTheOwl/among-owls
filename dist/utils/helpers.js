"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSort = exports.getWinningPlayer = exports.randomNumber = exports.handleWin = exports.getPlayerArray = exports.getNumberSuffix = exports.confirmRole = exports.removeRole = exports.addRole = exports.emptyDir = exports.mapPlayersForEmbed = exports.normalizeLink = exports.downloadFile = exports.asyncForEach = exports.wait = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../embeds"));
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
const { imageDir } = settings_1.default;
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
            const url = (0, exports.normalizeLink)(assetUrl);
            const path = `${directory}/${username}.jpg`;
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
const normalizeLink = (imageUrl) => {
    if ((imageUrl === null || imageUrl === void 0 ? void 0 : imageUrl.slice(0, 4)) === 'ipfs') {
        const ifpsHash = imageUrl.slice(7);
        imageUrl = `${ipfsGateway}${ifpsHash}`;
    }
    return imageUrl;
};
exports.normalizeLink = normalizeLink;
const mapPlayersForEmbed = (playerArr) => playerArr
    .filter((player) => !player.timedOut && !player.dead)
    .map((player) => ({
    name: player.username,
    value: `HP: ${player.hp}`,
}));
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
const handleWin = async (player, winByTimeout, game) => {
    // handle win
    game.active = false;
    __1.intervals.timeoutInterval && clearInterval(__1.intervals.timeoutInterval);
    // Increment score of winning player
    const winningUser = (await database_service_1.collections.users.findOne({
        _id: player.userId,
    }));
    const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1;
    await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, { $set: { yaoWins: updatedScore } });
    const embedData = {
        title: 'WINNER!!!',
        description: `${player.username}'s ${player.asset.unitName} ${winByTimeout
            ? 'won by default - all other players timed out!'
            : `destroyed the competition`}`,
        color: 'DARK_AQUA',
        image: player.asset.assetUrl,
    };
    game.players = {};
    (0, exports.emptyDir)(imageDir);
    return game.embed.edit((0, embeds_1.default)(embedData));
};
exports.handleWin = handleWin;
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);
exports.randomNumber = randomNumber;
const getWinningPlayer = (playerArr) => {
    const activePlayers = playerArr.filter((player) => !player.timedOut && !player.dead);
    let winByTimeout = false;
    const timedOutPlayers = playerArr.filter((player) => player.timedOut);
    // if (timedOutPlayers.length === playerArr.length - activePlayers.length) {
    //   winByTimeout = true
    // }
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
    console.log(arr);
    return arr;
};
exports.randomSort = randomSort;
