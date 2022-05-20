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
exports.normalizeLink = exports.downloadFile = exports.findAsset = exports.determineOwnership = exports.asyncForEach = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const ipfsGateway = process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/';
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
const downloadFile = (asset, directory, username) => __awaiter(void 0, void 0, void 0, function* () {
    const { assetUrl } = asset;
    if (assetUrl) {
        const url = (0, exports.normalizeLink)(assetUrl);
        console.log('url', url);
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
    else {
        // error
    }
});
exports.downloadFile = downloadFile;
const normalizeLink = (imageUrl) => {
    if ((imageUrl === null || imageUrl === void 0 ? void 0 : imageUrl.slice(0, 4)) === 'ipfs') {
        const ifpsHash = imageUrl.slice(7);
        console.log('IPFS GATEWAY', ipfsGateway);
        imageUrl = `${ipfsGateway}${ifpsHash}`;
    }
    return imageUrl;
};
exports.normalizeLink = normalizeLink;
