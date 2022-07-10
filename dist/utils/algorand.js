"use strict";
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
const determineOwnership = async function (address) {
    try {
        let { assets } = await algodClient.accountInformation(address).do();
        const { maxAssets } = settings_1.default;
        let walletOwned = false;
        const nftsOwned = [];
        // Create array of unique assetIds
        const uniqueAssets = [];
        assets.forEach((asset) => {
            // Check if opt-in asset
            if (asset['asset-id'] === Number(optInAssetId)) {
                walletOwned = true;
            }
            // ensure no duplicate assets
            const result = uniqueAssets.findIndex((item) => asset['asset-id'] === item['asset-id']);
            if (result <= -1 && asset.amount > 0) {
                uniqueAssets.push(asset);
            }
        });
        await (0, helpers_1.asyncForEach)(uniqueAssets, async (asset) => {
            var _a;
            if (nftsOwned.length < maxAssets) {
                const assetId = asset['asset-id'];
                const assetData = await (0, exports.findAsset)(assetId);
                if (assetData) {
                    const { params } = assetData;
                    if ((_a = params[`unit-name`]) === null || _a === void 0 ? void 0 : _a.includes(unitPrefix)) {
                        const { name, url } = params;
                        nftsOwned.push(new asset_1.default(assetId, name, url, params['unit-name']));
                    }
                }
            }
        });
        return {
            walletOwned,
            nftsOwned,
        };
    }
    catch (error) {
        console.log(error);
        return {
            walletOwned: false,
            nftsOwned: [],
        };
    }
};
exports.determineOwnership = determineOwnership;
const findAsset = async (assetId) => {
    try {
        const assetData = await algoIndexer.lookupAssetByID(assetId).do();
        if (assetData === null || assetData === void 0 ? void 0 : assetData.asset)
            return assetData.asset;
    }
    catch (error) {
        // console.log(error)
    }
};
exports.findAsset = findAsset;
const claimHoot = async (amount, receiverAddress) => {
    const params = await algodClient.getTransactionParams().do();
    const { sk, addr: senderAddress } = algosdk_1.default.mnemonicToSecretKey(hootAccountMnemonic);
    const revocationTarget = undefined;
    const closeRemainderTo = undefined;
    const note = undefined;
    const assetId = optInAssetId;
    let xtxn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParams(senderAddress, receiverAddress, closeRemainderTo, revocationTarget, amount, note, assetId, params);
    const rawSignedTxn = xtxn.signTxn(sk);
    let xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
    const confirmedTxn = await algosdk_1.default.waitForConfirmation(algodClient, xtx.txId, 4);
    console.log('Transaction ' +
        xtx.txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']);
};
exports.claimHoot = claimHoot;
