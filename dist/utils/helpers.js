"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPlayersForEmbed = exports.handleRolledRecently = exports.normalizeLink = exports.downloadFile = exports.findAsset = exports.determineOwnership = exports.asyncForEach = exports.wait = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const wait = (duration) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((res) => {
        setTimeout(res, duration);
    });
});
exports.wait = wait;
const asyncForEach = (array, callback) => __awaiter(void 0, void 0, void 0, function* () {
    for (let index = 0; index < array.length; index++) {
        try {
            yield callback(array[index], index, array);
        }
        catch (error) {
            console.log('ERROR', error);
        }
    }
});
exports.asyncForEach = asyncForEach;
const determineOwnership = function (algodclient, address, assetId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let accountInfo = yield algodclient.accountInformation(address).do();
            let assetOwned = false;
            let walletOwned = false;
            accountInfo.assets.forEach((asset) => {
                // Check for opt-in asset
                if (asset[`asset-id`] === Number(process.env.OPT_IN_ASSET_ID)) {
                    walletOwned = true;
                }
                // Check for entered asset
                if (asset['asset-id'] === assetId) {
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
    });
};
exports.determineOwnership = determineOwnership;
const findAsset = (assetId, indexer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield indexer.searchForAssets().index(assetId).do();
    }
    catch (error) {
        throw new Error('Error finding asset');
    }
});
exports.findAsset = findAsset;
const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/';
const downloadFile = (asset, directory, username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { assetUrl } = asset;
        if (assetUrl) {
            const url = (0, exports.normalizeLink)(assetUrl);
            const path = `${directory}/${username}.jpg`;
            const writer = fs_1.default.createWriteStream(path);
            const res = yield axios_1.default.get(url, {
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
});
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
