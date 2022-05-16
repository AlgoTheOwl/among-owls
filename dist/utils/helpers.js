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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAsset = exports.determineOwnership = void 0;
const determineOwnership = function (algodclient, address, assetId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let accountInfo = yield algodclient.accountInformation(address).do();
            let assetOwned = false;
            let walletOwned = false;
            accountInfo.assets.forEach((asset) => {
                // Check for opt-in asset
                if (asset[`asset-id`] === process.env.OPT_IN_ASSET_ID && !asset.amount) {
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
