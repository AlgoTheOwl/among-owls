"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRole = exports.emptyDir = exports.mapPlayersForEmbed = exports.handleRolledRecently = exports.normalizeLink = exports.downloadFile = exports.findAsset = exports.determineOwnership = exports.asyncForEach = exports.wait = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
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
                writer.on('error', reject);
            });
        }
    }
    catch (error) {
        throw new Error('Error downloading asset');
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
const handleRolledRecently = async (user, coolDownInterval) => {
    user.coolDownTimeLeft = coolDownInterval;
    while (user.coolDownTimeLeft > 0) {
        await (0, exports.wait)(1000);
        user.coolDownTimeLeft -= 1000;
    }
};
exports.handleRolledRecently = handleRolledRecently;
const mapPlayersForEmbed = (playerArr) => playerArr.map((player) => ({
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
        throw new Error('Error deleting contents of image directory');
    }
};
exports.emptyDir = emptyDir;
const addRole = async (interaction, roleName, user) => {
    var _a, _b;
    try {
        const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.name === roleName);
        const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === user.discordId);
        role && (await (member === null || member === void 0 ? void 0 : member.roles.add(role.id)));
    }
    catch (error) {
        throw new Error('Error adding role');
    }
};
exports.addRole = addRole;
