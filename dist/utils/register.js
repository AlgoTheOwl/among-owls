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
exports.processRegistration = void 0;
const operations_1 = require("../services/operations");
const algosdk_1 = __importDefault(require("algosdk"));
const helpers_1 = require("./helpers");
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
const processRegistration = (user, address, assetId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const algodClient = new algosdk_1.default.Algodv2(token, server, port);
        const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
        const { discordId, username, hp } = user;
        // Check if asset is owned and wallet has opt-in asset
        const { walletOwned, assetOwned } = yield (0, helpers_1.determineOwnership)(algodClient, address, assetId);
        const isOwned = walletOwned && assetOwned;
        if (isOwned) {
            // If owned, find full player and asset data
            const player = yield (0, operations_1.findPlayer)(discordId);
            const asset = yield (0, helpers_1.findAsset)(assetId, algoIndexer);
            const { name: assetName, url: assetUrl, 'unit-name': unitName, } = asset === null || asset === void 0 ? void 0 : asset.assets[0].params;
            // Check if it's a the right asset
            if (unitName.slice(0, unitPrefix.length) !== unitPrefix) {
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
            if (!player) {
                // Player doesn't exist, add to db
                yield (0, operations_1.addPlayer)({
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
            // Either wallet isn't owned or asset is not owned by wallet
            const status = walletOwned
                ? `Looks like the wallet address entered doesn't hold this asset, please try again!`
                : `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`;
            return {
                status,
                registeredUser: user,
            };
        }
        return {
            status: "Looks like you don't own this NFT, try again with one in your possession.",
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
});
exports.processRegistration = processRegistration;
