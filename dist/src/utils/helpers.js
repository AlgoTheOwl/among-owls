"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPlayersForEmbed = exports.handleRolledRecently = exports.normalizeLink = exports.downloadFile = exports.findAsset = exports.determineOwnership = exports.asyncForEach = exports.wait = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const wait = async (duration) => {
    await new Promise((res) => {
        setTimeout(res, duration);
    });
};
exports.wait = wait;
const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        try {
            await callback(array[index], index, array);
        }
        catch (error) {
            console.log('ERROR', error);
        }
    }
};
exports.asyncForEach = asyncForEach;
const determineOwnership = async function (algodclient, address, assetId, test) {
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
            asset['asset-id'] === assetId && test
                ? asset.amount >= 0
                : asset.amount > 0) {
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
        console.log(error);
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
const handleRolledRecently = (user, game, coolDownInterval) => {
    game === null || game === void 0 ? void 0 : game.rolledRecently.add(user.discordId);
    setTimeout(() => {
        game === null || game === void 0 ? void 0 : game.rolledRecently.delete(user.discordId);
    }, coolDownInterval + 1500);
};
exports.handleRolledRecently = handleRolledRecently;
const mapPlayersForEmbed = (playerArr) => playerArr.map((player) => ({
    name: player.username,
    value: `${player.asset.assetName} - HP: ${player.hp}`,
}));
exports.mapPlayersForEmbed = mapPlayersForEmbed;
