"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convergeTxnData = exports.fetchRecentTransaction = exports.searchForTransactions = exports.setupTxns = exports.findAsset = exports.isAssetCollectionAsset = exports.getAssetIdArray = exports.determineOwnership = void 0;
const asset_1 = __importDefault(require("../models/asset"));
const helpers_1 = require("./helpers");
const algosdk_1 = __importDefault(require("algosdk"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const pureStakeApi = process.env.PURESTAKE_API;
const algoIndexerNode = process.env.ALGO_INDEXER_NODE;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const unitPrefix = process.env.UNIT_NAME;
const token = {
    'X-API-Key': pureStakeApi,
};
const indexerServer = algoIndexerNode;
const port = '';
const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
/**
 * Grabs users Algo acocunt assets and returns all instances of collection assets
 * Authenticates wallet by ensuring wallet has opted in to game token
 * Tracks users Hoot token amount
 * @param address
 * @param maxAssets
 * @returns {{walletOwned: boolean, nftsOwned: Asset[], hootOwned: number}}
 */
const determineOwnership = async function (address, maxAssets) {
    try {
        await (0, exports.setupTxns)();
        let { assets } = await algoIndexer
            .lookupAccountAssets(address)
            .limit(10000)
            .do();
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
        // Determine which assets are part of bot collection
        uniqueAssets.forEach((asset) => {
            if (assetIdsOwned.length < maxAssets) {
                const assetId = asset['asset-id'];
                if ((0, exports.isAssetCollectionAsset)(assetId, assetIdArr)) {
                    assetIdsOwned.push(assetId);
                }
            }
        });
        // fetch data for each asset but not too quickly
        await (0, helpers_1.asyncForEach)(assetIdsOwned, async (assetId) => {
            var _a;
            const assetData = await (0, exports.findAsset)(assetId);
            if (assetData) {
                const { params } = assetData;
                if ((_a = params[`unit-name`]) === null || _a === void 0 ? void 0 : _a.includes(unitPrefix)) {
                    const { name, url } = params;
                    nftsOwned.push(new asset_1.default(assetId, name, url, params['unit-name'], 0, 0, 0));
                }
            }
            await (0, helpers_1.wait)(250);
        });
        return {
            walletOwned,
            nftsOwned,
            hootOwned,
        };
    }
    catch (error) {
        console.log('****** ERROR DETERMINING OWNERSHIP ******', error);
        return {
            walletOwned: false,
            nftsOwned: [],
            hootOwned: 0,
        };
    }
};
exports.determineOwnership = determineOwnership;
/**
 * Using data from transaction record of creator wallet, produces
 * unique array of all assets created by said wallet
 * @returns {Array}
 */
const getAssetIdArray = () => {
    const assetIdArr = [];
    const txnData = getTxnData();
    txnData.transactions.forEach((txn) => {
        const assetId = txn['asset-config-transaction']['asset-id'];
        const createdAssetId = txn['created-asset-index'];
        if (assetId) {
            const result = assetIdArr.findIndex((item) => item === assetId);
            result <= -1 && assetIdArr.push(assetId);
        }
        if (createdAssetId) {
            const result2 = assetIdArr.findIndex((item) => item === createdAssetId);
            result2 <= -1 && assetIdArr.push(createdAssetId);
        }
    });
    return assetIdArr;
};
exports.getAssetIdArray = getAssetIdArray;
/**
 * Searches array of collection assets for match of assetId passed to function
 * @param assetId
 * @param assetIdArr
 * @returns {Boolean}
 */
const isAssetCollectionAsset = (assetId, assetIdArr) => assetIdArr.includes(assetId);
exports.isAssetCollectionAsset = isAssetCollectionAsset;
/**
 * Finds Asset data on Algo blockchain
 * @param assetId
 * @returns {Promise<AlgoAssetData>}
 */
const findAsset = async (assetId) => {
    try {
        const assetData = await algoIndexer.searchForAssets().index(assetId).do();
        if (assetData === null || assetData === void 0 ? void 0 : assetData.assets)
            return assetData.assets[0];
    }
    catch (error) {
        console.log('****** ERROR FINDING ASSET ******', error);
    }
};
exports.findAsset = findAsset;
/**
 * Checks if we have a txnData file, creates one if not
 * Fetches and reduces txnData from all creator wallets and writes file
 */
const setupTxns = async () => {
    let update = true;
    if (!fs_1.default.existsSync('dist/txnData/txnData.json')) {
        update = false;
        fs_1.default.writeFileSync('dist/txnData/txnData.json', '');
    }
    const txnData = await (0, exports.convergeTxnData)(__1.creatorAddressArr, update);
    fs_1.default.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData));
};
exports.setupTxns = setupTxns;
/**
 * Finds all transactions from address
 * @param address
 * @returns {Promise<TxnData>}
 */
const searchForTransactions = async (address) => {
    const type = 'acfg';
    const txns = (await algoIndexer
        .searchForTransactions()
        .address(address)
        .txType(type)
        .do());
    return txns;
};
exports.searchForTransactions = searchForTransactions;
/**
 * Grabs all transactions from an account address since a specific round
 * @param accountAddress
 * @param currentRound
 * @returns {Promise<TxnData>}
 */
const fetchRecentTransaction = async (accountAddress, currentRound) => {
    const type = 'acfg';
    return (await algoIndexer
        .searchForTransactions()
        .address(accountAddress)
        .txType(type)
        .minRound(currentRound)
        .do());
};
exports.fetchRecentTransaction = fetchRecentTransaction;
/**
 * Fetches all data and reduces it to one object
 * @param creatorAddresses
 * @param update
 * @returns {Promise<TxnData>}
 */
const convergeTxnData = async (creatorAddresses, update) => {
    const updateCalls = [];
    const txnData = getTxnData();
    creatorAddresses.forEach((address) => {
        if (update) {
            const currentRound = txnData['current-round'];
            updateCalls.push((0, exports.fetchRecentTransaction)(address, currentRound));
        }
        else {
            updateCalls.push((0, exports.searchForTransactions)(address));
        }
    });
    const txnDataArr = await Promise.all(updateCalls);
    const reduceArr = [...txnDataArr];
    if (update) {
        const currentTxnData = getTxnData();
        reduceArr.push(currentTxnData);
    }
    return reduceTxnData(reduceArr);
};
exports.convergeTxnData = convergeTxnData;
/**
 * Reduce operation for each TxnData object
 * @param txnDataArray
 * @returns {TxnData}
 */
const reduceTxnData = (txnDataArray) => {
    const reducedData = txnDataArray.reduce((prevTxnData, txnData) => {
        // select the most recent round
        return {
            ['current-round']: prevTxnData['current-round'] < txnData['current-round']
                ? prevTxnData['current-round']
                : txnData['current-round'],
            ['next-token']: prevTxnData['next-token'],
            transactions: [...prevTxnData.transactions, ...txnData.transactions],
        };
    });
    return reducedData;
};
/**
 * Grabs and parses transaction data locally
 * @returns {TxnData | undefined}
 */
const getTxnData = () => {
    try {
        return JSON.parse(fs_1.default.readFileSync('dist/txnData/txnData.json', 'utf-8'));
    }
    catch (error) {
        console.log('****** NO TXN DATA PRESENT ******');
    }
};
