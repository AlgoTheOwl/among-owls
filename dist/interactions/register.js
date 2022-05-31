"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRegistration = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
const helpers_1 = require("../utils/helpers");
const user_1 = __importDefault(require("../models/user"));
const database_service_1 = require("../database/database.service");
const asset_1 = __importDefault(require("../models/asset"));
const player_1 = __importDefault(require("../models/player"));
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
const processRegistration = async (username, discordId, address, assetId, gameType = 'yao', hp) => {
    var _a, _b, _c;
    try {
        const algodClient = new algosdk_1.default.Algodv2(token, server, port);
        const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
        // Attempt to find user in db
        let user = (await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.findOne({
            discordId,
        })));
        // If user doesn't exist, add to db and grab instance
        if (!user) {
            const userEntry = new user_1.default(username, discordId, address, []);
            const { acknowledged, insertedId } = await ((_b = database_service_1.collections.users) === null || _b === void 0 ? void 0 : _b.insertOne(userEntry));
            if (acknowledged) {
                user = (await ((_c = database_service_1.collections.users) === null || _c === void 0 ? void 0 : _c.findOne({
                    _id: insertedId,
                })));
            }
            else {
                return {
                    status: 'Something went wrong during registration, please try again',
                };
            }
        }
        // Check if asset is owned and wallet has opt-in asset
        const { walletOwned, assetOwned } = await (0, helpers_1.determineOwnership)(algodClient, address, assetId);
        const isOwned = walletOwned && assetOwned;
        if (!isOwned) {
            const status = walletOwned
                ? `Looks like the wallet address entered doesn't hold this asset, please try again!`
                : `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`;
            return {
                status,
            };
        }
        // // // // If owned, find full player and asset data
        const player = await database_service_1.collections.yaoPlayers.findOne({
            discordId,
        });
        console.log('player', player);
        const asset = await (0, helpers_1.findAsset)(assetId, algoIndexer);
        // if there's no asset, return right away
        if (!asset) {
            return {
                status: "Looks like you don't own this NFT, try again with one in your possession.",
            };
        }
        // Destructure asset values and store in db
        const { name: assetName, url: assetUrl, 'unit-name': unitName, } = asset === null || asset === void 0 ? void 0 : asset.assets[0].params;
        let assetEntry;
        if (user === null || user === void 0 ? void 0 : user._id) {
            const dbEntry = await database_service_1.collections.assets.findOne({ assetId });
            if (dbEntry) {
                assetEntry = dbEntry;
            }
            else {
                assetEntry = new asset_1.default(user === null || user === void 0 ? void 0 : user._id, assetId, assetName, assetUrl, unitName);
                await database_service_1.collections.assets.insertOne(assetEntry);
            }
            // add error handling here
        }
        // Check to make sure NFT is in correct series
        const incorrectCollection = unitName.slice(0, unitPrefix.length) !== unitPrefix;
        if (incorrectCollection) {
            return {
                status: `This asset is not a ${unitPrefix}, please try again`,
            };
        }
        if (player) {
            // if there is already a player, only add asset
            return {
                status: "Looks like you've already registered",
            };
        }
        // Player doesn't exist, add to db
        if (assetEntry) {
            const playerEntry = new player_1.default(username, discordId, address, assetEntry, hp);
            const result = await database_service_1.collections.yaoPlayers.insertOne(playerEntry);
            console.log('result', result);
        }
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
        };
    }
};
exports.processRegistration = processRegistration;
