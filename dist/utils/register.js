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
const algosdk_1 = __importDefault(require("algosdk"));
const algoNode = process.env.ALGO_NODE;
const pureStakeApi = process.env.PURESTAKE_API;
const algoIndexerNode = process.env.ALGO_INDEXER_NODE;
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
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
        const { id: discordId, username } = user;
        // Check if asset is owned and wallet has opt-in asset
        const { walletOwned, assetOwned } = yield determineOwnership(algodClient, address, assetId);
        const isOwned = walletOwned && assetOwned;
        if (isOwned) {
            // If owned, find full player and asset data
            const player = yield findPlayer(discordId);
            const asset = yield findAsset(assetId, algoIndexer);
            const { name: assetName, url: assetUrl, 'unit-name': unitName, } = asset === null || asset === void 0 ? void 0 : asset.assets[0].params;
            // Check if it's a Randy Cone
            if (unitName.slice(0, 5) !== 'RCONE') {
                return {
                    status: 'This asset is not a randy cone, please try again with a meltable NFT',
                    asset: null,
                    registeredUser: user,
                };
            }
            const assetEntry = {
                assetUrl,
                assetName,
                assetId: assetId,
                unitName,
            };
            if (player) {
                const assetCount = player.assets.length + 1;
                if (assetCount >= 5) {
                    return {
                        status: `You've added 5 or more assets already`,
                        asset: null,
                        registeredUser: user,
                    };
                }
                yield addPlayerAsset(discordId, assetEntry);
                return {
                    status: `Added ${unitName} for melting - this asset number ${assetCount} out of 5`,
                    asset: assetEntry,
                    registeredUser: user,
                };
            }
            // Player doesn't exist, add to db
            yield addPlayer({
                discordId,
                username,
                address: address,
                assets: [assetEntry],
            });
            return {
                status: `Added ${unitName} for melting - you can add up to 4 more assets`,
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
            asset: null,
            registeredUser: user,
        };
    }
    catch (error) {
        return {
            status: 'Something went wrong during registration, please try again',
            asset: null,
            registeredUser: user,
        };
    }
});
exports.processRegistration = processRegistration;
const findAsset = (assetId, indexer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield indexer.searchForAssets().index(assetId).do();
    }
    catch (error) {
        throw new Error('Error finding asset');
    }
});
const determineOwnership = function (algodclient, address, assetId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let accountInfo = yield algodclient.accountInformation(address).do();
            let assetOwned = false;
            let walletOwned = false;
            accountInfo.assets.forEach((asset) => {
                // Check for opt-in asset
                if (asset[`asset-id`] === optInAssetId && !asset.amount) {
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
