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
exports.claimHoot = exports.findAsset = exports.determineOwnership = void 0;
const asset_1 = __importDefault(require("../models/asset"));
const helpers_1 = require("./helpers");
const algosdk_1 = __importDefault(require("algosdk"));
const settings_1 = __importDefault(require("../settings"));
const algoNode = process.env.ALGO_NODE;
const pureStakeApi = process.env.PURESTAKE_API;
const algoIndexerNode = process.env.ALGO_INDEXER_NODE;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const unitPrefix = process.env.UNIT_NAME;
const hootAccountMnemonic = process.env.HOOT_SOURCE_MNEMONIC;
const token = {
    'X-API-Key': pureStakeApi,
};
const server = algoNode;
const indexerServer = algoIndexerNode;
const port = '';
const algodClient = new algosdk_1.default.Algodv2(token, server, port);
const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
const determineOwnership = function (address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { assets } = yield algoIndexer.lookupAccountAssets(address).do();
            const { maxAssets } = settings_1.default;
            let walletOwned = false;
            const nftsOwned = [];
            let hootOwned = 0;
            // Create array of unique assetIds
            const uniqueAssets = [];
            assets.forEach((asset) => {
                // Check if opt-in asset
                if (asset['asset-id'] === Number(optInAssetId)) {
                    walletOwned = true;
                    hootOwned = asset.amount;
                }
                // ensure no duplicate assets
                const result = uniqueAssets.findIndex((item) => asset['asset-id'] === item['asset-id']);
                if (result <= -1 && asset.amount > 0) {
                    uniqueAssets.push(asset);
                }
            });
            yield (0, helpers_1.asyncForEach)(uniqueAssets, (asset) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (nftsOwned.length < maxAssets) {
                    const assetId = asset['asset-id'];
                    const assetData = yield (0, exports.findAsset)(assetId);
                    if (assetData) {
                        const { params } = assetData;
                        if ((_a = params[`unit-name`]) === null || _a === void 0 ? void 0 : _a.includes(unitPrefix)) {
                            const { name, url } = params;
                            nftsOwned.push(new asset_1.default(assetId, name, url, params['unit-name']));
                        }
                    }
                }
            }));
            return {
                walletOwned,
                nftsOwned,
                hootOwned,
            };
        }
        catch (error) {
            console.log(error);
            return {
                walletOwned: false,
                nftsOwned: [],
                hootOwned: 0,
            };
        }
    });
};
exports.determineOwnership = determineOwnership;
const findAsset = (assetId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assetData = yield algoIndexer.searchForAssets().index(assetId).do();
        if (assetData === null || assetData === void 0 ? void 0 : assetData.assets)
            return assetData.assets[0];
    }
    catch (error) {
        console.log(error);
    }
});
exports.findAsset = findAsset;
const claimHoot = (amount, receiverAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = yield algodClient.getTransactionParams().do();
        const { sk, addr: senderAddress } = algosdk_1.default.mnemonicToSecretKey(hootAccountMnemonic);
        const revocationTarget = undefined;
        const closeRemainderTo = undefined;
        const note = undefined;
        const assetId = optInAssetId;
        let xtxn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParams(senderAddress, receiverAddress, closeRemainderTo, revocationTarget, amount, note, assetId, params);
        const rawSignedTxn = xtxn.signTxn(sk);
        let xtx = yield algodClient.sendRawTransaction(rawSignedTxn).do();
        return yield algosdk_1.default.waitForConfirmation(algodClient, xtx.txId, 4);
    }
    catch (error) {
        console.log(error);
    }
});
exports.claimHoot = claimHoot;
