"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRegistration = void 0;
const algorand_1 = require("./algorand");
const settings_1 = require("./settings");
const user_1 = __importDefault(require("../models/user"));
const database_service_1 = require("../database/database.service");
// Globals
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
const unitName = process.env.UNIT_NAME;
/**
 * Takes user info, queries the blockchain and finds owned assets and stores entry in database
 * @param username
 * @param discordId
 * @param address algorand wallet address
 * @param channelId
 * @returns {RegistrationResult}
 */
const processRegistration = async (username, discordId, address, channelId) => {
    var _a, _b, _c;
    try {
        const { maxAssets, holdingsRefreshTime } = await (0, settings_1.getSettings)(channelId);
        // Attempt to find user in db
        let user = (await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.findOne({
            discordId,
        })));
        // Check to see if wallet has opt-in asset
        // Retreive assetIds from specific collections
        const { walletOwned, nftsOwned, hootOwned } = await (0, algorand_1.determineOwnership)(address, maxAssets);
        if (!walletOwned) {
            return {
                status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
            };
        }
        if (!(nftsOwned === null || nftsOwned === void 0 ? void 0 : nftsOwned.length)) {
            return {
                status: `You have no ${unitName}s in this wallet. Please try again with a different address`,
            };
        }
        const keyedNfts = keyNfts(nftsOwned);
        // Generate holdings refresh timestamp by days
        const holdingsRefreshDate = Date.now() + holdingsRefreshTime * 86400000;
        // If user doesn't exist, add to db and grab instance
        if (!user) {
            const userEntry = new user_1.default(username, discordId, address, keyedNfts, 0, holdingsRefreshDate);
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
        else {
            // Update current user entry with relevent data
            const mergedAssets = mergeAssets(user.assets, keyedNfts);
            await database_service_1.collections.users.findOneAndUpdate({ _id: user._id }, {
                $set: {
                    assets: mergedAssets,
                    address: address,
                    holdingsRefreshDate,
                    hoot: hootOwned,
                },
            });
        }
        return {
            status: `Registration complete! Enjoy the game.`,
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
/**
 * Merge current and updated user assets ensuring we retain data from gameplay
 * @param userAssets current user assets stored in db
 * @param updatedAssets current user assets from blockchain
 * @returns {KeyedAssets}
 */
const mergeAssets = (userAssets, updatedAssets) => {
    const updatedAssetArr = [];
    Object.values(updatedAssets).forEach((asset) => {
        // if user already has asset, use current asset data
        if (userAssets[asset.assetId]) {
            updatedAssetArr.push(userAssets[asset.assetId]);
        }
        else {
            updatedAssetArr.push(asset);
        }
    });
    return keyNfts(updatedAssetArr);
};
/**
 * Take an array of assets and key them into an object
 * @param nftArr array of user assets
 * @returns {KeyedAssets}
 */
const keyNfts = (nftArr) => {
    const keyedNfts = {};
    nftArr.forEach((nft) => {
        keyedNfts[nft.assetId] = nft;
    });
    return keyedNfts;
};
