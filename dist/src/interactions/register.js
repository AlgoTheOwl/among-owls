"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRegistration = void 0;
const operations_1 = require("../database/operations");
const algosdk_1 = __importDefault(require("algosdk"));
const helpers_1 = require("../utils/helpers");
const algoNode = process.env.ALGO_NODE;
const pureStakeApi = process.env.PURESTAKE_API;
const algoIndexerNode = process.env.ALGO_INDEXER_NODE;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const unitPrefix = process.env.UNIT_NAME;
const token = {
    'X-API-Key': pureStakeApi,
};
const server = algoNode;
const indexerServer = algoIndexerNode;
const port = '';
const processRegistration = async (user, test) => {
    try {
        const algodClient = new algosdk_1.default.Algodv2(token, server, port);
        const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
        const { discordId, username, hp, address, asset: { assetId }, } = user;
        // Check if asset is owned and wallet has opt-in asset
        const { walletOwned, assetOwned } = await (0, helpers_1.determineOwnership)(algodClient, address, assetId, true);
        const isOwned = walletOwned && assetOwned;
        if (!isOwned) {
            const status = walletOwned
                ? `Looks like the wallet address entered doesn't hold this asset, please try again!`
                : `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`;
            return {
                status,
                registeredUser: user,
            };
        }
        // If owned, find full player and asset data
        const player = await (0, operations_1.findPlayer)(discordId);
        const asset = await (0, helpers_1.findAsset)(assetId, algoIndexer);
        const { name: assetName, url: assetUrl, 'unit-name': unitName, } = asset === null || asset === void 0 ? void 0 : asset.assets[0].params;
        const incorrectCollection = unitName.slice(0, unitPrefix.length) !== unitPrefix;
        if (!asset) {
            return {
                status: "Looks like you don't own this NFT, try again with one in your possession.",
                registeredUser: user,
            };
        }
        if (player) {
            return {
                status: "Looks like you've already registered",
                registeredUser: user,
            };
        }
        // Check to make sure NFT is in correct series
        if (incorrectCollection) {
            return {
                status: 'This asset is not a AOWL, please try again',
                registeredUser: user,
            };
        }
        const assetEntry = {
            assetUrl,
            assetName,
            assetId: assetId,
            unitName,
        };
        // Player doesn't exist, add to db
        await (0, operations_1.addPlayer)({
            discordId,
            username,
            address: address,
            asset: assetEntry,
            hp,
        });
        return {
            status: `Added ${unitName} - Prepare to attack!`,
            asset: assetEntry,
            registeredUser: user,
        };
    }
    catch (error) {
        console.log('ERROR::', error);
        return {
            status: 'Something went wrong during registration, please try again',
            registeredUser: user,
        };
    }
};
exports.processRegistration = processRegistration;
