"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactions = exports.searchForTransactions = exports.claimHoot = exports.findAsset = exports.isAssetCollectionAsset = exports.getAssetIdArray = exports.determineOwnership = void 0;
const asset_1 = __importDefault(require("../models/asset"));
const helpers_1 = require("./helpers");
const algosdk_1 = __importDefault(require("algosdk"));
const settings_1 = __importDefault(require("../settings"));
const fs_1 = __importDefault(require("fs"));
const txt_json_1 = __importDefault(require("../txnData/txt.json"));
const algoNode = process.env.ALGO_NODE;
const pureStakeApi = process.env.PURESTAKE_API;
const algoIndexerNode = process.env.ALGO_INDEXER_NODE;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const unitPrefix = process.env.UNIT_NAME;
const hootAccountMnemonic = process.env.HOOT_SOURCE_MNEMONIC;
const creatorAddress = process.env.CREATOR_ADDRESS;
const token = {
    'X-API-Key': pureStakeApi,
};
const server = algoNode;
const indexerServer = algoIndexerNode;
const port = '';
const algodClient = new algosdk_1.default.Algodv2(token, server, port);
const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
const txData = JSON.parse(JSON.stringify(txt_json_1.default));
const determineOwnership = async function (address) {
    try {
        let { assets } = await algoIndexer.lookupAccountAssets(address).do();
        const { maxAssets } = settings_1.default;
        let walletOwned = false;
        const assetIdsOwned = [];
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
        const assetIdArr = (0, exports.getAssetIdArray)();
        uniqueAssets.forEach((asset) => {
            if (assetIdsOwned.length < maxAssets) {
                const assetId = asset['asset-id'];
                if ((0, exports.isAssetCollectionAsset)(assetId, assetIdArr)) {
                    assetIdsOwned.push(assetId);
                }
            }
        });
        console.log(assetIdsOwned);
        await (0, helpers_1.asyncForEach)(assetIdsOwned, async (assetId) => {
            var _a;
            const assetData = await (0, exports.findAsset)(assetId);
            console.log(assetData);
            if (assetData) {
                const { params } = assetData;
                if ((_a = params[`unit-name`]) === null || _a === void 0 ? void 0 : _a.includes(unitPrefix)) {
                    const { name, url } = params;
                    nftsOwned.push(new asset_1.default(assetId, name, url, params['unit-name']));
                }
            }
            await (0, helpers_1.wait)(1000);
        });
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
};
exports.determineOwnership = determineOwnership;
const getAssetIdArray = () => {
    const assetIdArr = [];
    txt_json_1.default.transactions.forEach((txn) => {
        const assetId = txn['asset-config-transaction']['asset-id'];
        const result = assetIdArr.findIndex((item) => item === assetId);
        result <= -1 && assetIdArr.push(assetId);
    });
    return assetIdArr;
};
exports.getAssetIdArray = getAssetIdArray;
const isAssetCollectionAsset = (assetId, assetIdArr) => assetIdArr.includes(assetId);
exports.isAssetCollectionAsset = isAssetCollectionAsset;
const findAsset = async (assetId) => {
    try {
        const assetData = await algoIndexer.searchForAssets().index(assetId).do();
        if (assetData === null || assetData === void 0 ? void 0 : assetData.assets)
            return assetData.assets[0];
    }
    catch (error) {
        console.log(error);
    }
};
exports.findAsset = findAsset;
const claimHoot = async (amount, receiverAddress) => {
    try {
        const params = await algodClient.getTransactionParams().do();
        const { sk, addr: senderAddress } = algosdk_1.default.mnemonicToSecretKey(hootAccountMnemonic);
        const revocationTarget = undefined;
        const closeRemainderTo = undefined;
        const note = undefined;
        const assetId = optInAssetId;
        let xtxn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParams(senderAddress, receiverAddress, closeRemainderTo, revocationTarget, amount, note, assetId, params);
        const rawSignedTxn = xtxn.signTxn(sk);
        let xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
        return await algosdk_1.default.waitForConfirmation(algodClient, xtx.txId, 4);
    }
    catch (error) {
        console.log(error);
    }
};
exports.claimHoot = claimHoot;
const searchForTransactions = async () => {
    const type = 'acfg';
    const txns = await algoIndexer
        .searchForTransactions()
        .address(creatorAddress)
        .txType(type)
        .do();
    fs_1.default.writeFileSync('dist/data/txt.json', JSON.stringify(txns));
};
exports.searchForTransactions = searchForTransactions;
const updateTransactions = async () => {
    const currentRound = txt_json_1.default['current-round'];
    const type = 'acfg';
    const account = 'AOWLLUX3BBLDV6KUZYQ7FBZTIWGWRRJO6B5XL2DFQ6WLITHUK26OO7IGMI';
    const newTxns = await algoIndexer
        .searchForTransactions()
        .address(account)
        .txType(type)
        .minRound(currentRound)
        .do();
    const newTxnData = Object.assign(Object.assign({}, txt_json_1.default), { trasactions: [txData.transactions, ...newTxns.transactions] });
    fs_1.default.writeFileSync('dist/data/txt.json', JSON.stringify(newTxnData));
};
exports.updateTransactions = updateTransactions;
