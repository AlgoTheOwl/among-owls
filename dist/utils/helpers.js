"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineWin = exports.randomNumber = exports.handleWin = exports.getPlayerArray = exports.getNumberSuffix = exports.confirmRole = exports.addRole = exports.emptyDir = exports.mapPlayersForEmbed = exports.handleRolledRecently = exports.normalizeLink = exports.downloadFile = exports.findAsset = exports.determineOwnership = exports.asyncForEach = exports.wait = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const __1 = require("..");
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../embeds"));
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
const determineOwnership = async function (algodclient, address, assetId) {
    try {
        let accountInfo = await algodclient.accountInformation(address).do();
        let assetOwned = false;
        let walletOwned = false;
        accountInfo.assets.forEach((asset) => {
            // Check for opt-in asset
            if (asset[`asset-id`] === Number(process.env.OPT_IN_ASSET_ID)) {
                walletOwned = true;
            }
            // Check for entered asset
            if (
            // test case option
            asset['asset-id'] === assetId &&
                asset.amount > 0) {
                assetOwned = true;
            }
        });
        return {
            assetOwned,
            walletOwned,
        };
    }
    catch (error) {
        console.log(error);
        throw new Error('error determening ownership');
    }
};
exports.determineOwnership = determineOwnership;
const findAsset = async (assetId, indexer) => {
    try {
        return await indexer.searchForAssets().index(assetId).do();
    }
    catch (error) {
        throw new Error('Error finding asset');
    }
};
exports.findAsset = findAsset;
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
const handleRolledRecently = async (player, coolDownInterval) => {
    player.coolDownTimeLeft = coolDownInterval;
    while (player.coolDownTimeLeft > 0) {
        await (0, exports.wait)(1000);
        player.coolDownTimeLeft -= 1000;
    }
    // turn rolled recently to true
    player.rolledRecently = true;
    // set Timeout and remove after 20 seconds
    setTimeout(() => {
        player.rolledRecently = false;
    }, 20000);
};
exports.handleRolledRecently = handleRolledRecently;
const mapPlayersForEmbed = (playerArr) => playerArr
    .filter((player) => !player.timedOut)
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
        console.log(error);
        throw new Error('Error deleting contents of image directory');
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
        throw new Error('Error adding role');
    }
};
exports.addRole = addRole;
const removeRole = async (interaction, roleId, discordId) => {
    var _a, _b;
    const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.id === roleId);
    const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === discordId);
    role && (await (member === null || member === void 0 ? void 0 : member.roles.remove(role.id)));
};
const confirmRole = async (roleId, interaction, userId) => {
    var _a;
    // const role = interaction.guild?.roles.cache.find((role) => role.id === roleId)
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
const handleWin = async (playerArr, interaction) => {
    if (!interaction.isCommand())
        return;
    const winner = playerArr[0];
    // handle win
    __1.game.active = false;
    // Increment score of winning player
    const winningUser = (await database_service_1.collections.users.findOne({
        _id: winner.userId,
    }));
    const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1;
    await database_service_1.collections.users.findOneAndUpdate({ _id: winner.userId }, { $set: { yaoWins: updatedScore } });
    const embedData = {
        title: 'WINNER!!!',
        description: `${winner.username}'s ${winner.asset.unitName} destroyed the competition`,
        color: 'DARK_AQUA',
        image: winner.asset.assetUrl,
    };
    interaction.followUp({ ephemeral: true, content: 'Woo-Hoot! You won!' });
    // collections.yaoPlayers.deleteMany({})
    // asyncForEach(playerArr, (player: Player) => {
    //   removeRole(interaction, process.env.REGISTERED_ID, player.discordId)
    // })
    return __1.game.embed.edit((0, embeds_1.default)(embedData));
};
exports.handleWin = handleWin;
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);
exports.randomNumber = randomNumber;
const determineWin = (playerArr) => {
    return (playerArr.filter((player) => !player.timedOut).length === 1 ||
        playerArr.length === 1);
};
exports.determineWin = determineWin;
