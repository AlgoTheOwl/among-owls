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
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const helpers_2 = require("../utils/helpers");
const settings_1 = __importDefault(require("../settings"));
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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register')
        .setDescription('register for When AOWLS Attack')
        .addStringOption((option) => option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)),
    // .addNumberOption((option) =>
    //   option
    //     .setName('assetid')
    //     .setDescription('enter your AOWLS asset ID')
    //     .setRequired(true)
    // ),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user, options } = interaction;
        const { hp } = settings_1.default;
        if (__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) {
            return interaction.reply({
                content: 'Please wait until after the game ends to register',
                ephemeral: true,
            });
        }
        // TODO: add ability to register for different games here
        const address = options.getString('address');
        // const assetId = options.getNumber('assetid')
        const { username, id } = user;
        if (address) {
            const { status, registeredUser, asset } = await (0, exports.processRegistration)(username, id, address, 
            // assetId,
            'yao', hp);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_2.addRole)(interaction, process.env.REGISTERED_ID, registeredUser);
            }
            await interaction.reply({
                ephemeral: registeredUser ? false : true,
                content: status,
            });
        }
    },
};
const processRegistration = async (username, discordId, address, 
// assetId: number,
gameType = 'yao', hp) => {
    var _a, _b, _c;
    try {
        const algodClient = new algosdk_1.default.Algodv2(token, server, port);
        const algoIndexer = new algosdk_1.default.Indexer(token, indexerServer, port);
        // Attempt to find user in db
        let user = (await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.findOne({
            discordId,
        })));
        // Check if asset is owned and wallet has opt-in asset
        // Retreive assetIds from specific collections
        const { walletOwned, nftsOwned } = await (0, helpers_1.determineOwnership)(algodClient, algoIndexer, address
        // assetId
        );
        // If user doesn't exist, add to db and grab instance
        if (!user) {
            const userEntry = new user_1.default(username, discordId, address, nftsOwned);
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
            database_service_1.collections.users.findOneAndUpdate({ _id: user._id }, { $set: { assets: [...user.assets, ...nftsOwned], address } });
        }
        // const isOwned = walletOwned && assetOwned
        if (!walletOwned) {
            return {
                status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
            };
        }
        // // // // If owned, find full player and asset data
        // const player = (await collections.yaoPlayers.findOne({
        //   discordId,
        // })) as WithId<Player>
        // const asset = await findAsset(assetId, algoIndexer)
        // if there's no asset, return right away
        // if (!asset) {
        //   return {
        //     status:
        //       "Looks like you don't own this NFT, try again with one in your possession.",
        //   }
        // }
        // Destructure asset values and store in db
        // const {
        //   name: assetName,
        //   url: assetUrl,
        //   'unit-name': unitName,
        // } = asset?.params
        // let assetEntry: Asset | undefined
        // let assetStored = false
        // if (user?._id) {
        //   const dbAssetEntry = (await collections.assets.findOne({
        //     assetId,
        //   })) as WithId<Asset>
        //   if (dbAssetEntry) {
        //     assetEntry = dbAssetEntry
        //     assetStored = true
        //   } else {
        //     assetEntry = new Asset(
        //       user?._id,
        //       assetId,
        //       assetName,
        //       assetUrl,
        //       unitName
        //     )
        //     // Add asset
        //     await collections.assets.insertOne(assetEntry)
        //     // Add asset ref to user object
        //     await collections.users.findOneAndUpdate(
        //       { _id: user._id },
        //       { $set: { assets: [...user.assets, assetId] } }
        //     )
        //   }
        //   // add error handling here
        // }
        // Check to make sure NFT is in correct series
        // const incorrectCollection =
        //   unitName.slice(0, unitPrefix.length) !== unitPrefix
        // if (incorrectCollection) {
        //   return {
        //     status: `This asset is not a ${unitPrefix}, please try again`,
        //   }
        // }
        // if (player) {
        // if player exists and asset is stored, return
        // if (assetStored) {
        //   return {
        //     status: "Looks like you've already registered",
        //   }
        // }
        // if player and new asset, update player entry
        //   await collections.yaoPlayers.findOneAndUpdate(
        //     { _id: player._id },
        //     { $set: { asset: assetEntry } }
        //   )
        //   return {
        //     status: `Replaced previous asset with ${assetEntry?.unitName} `,
        //   }
        // }
        // // Player doesn't exist, add to db
        // if (assetEntry) {
        //   const playerEntry = new Player(
        //     username,
        //     discordId,
        //     address,
        //     assetEntry,
        //     user._id,
        //     hp
        //   )
        //   await collections.yaoPlayers.insertOne(playerEntry)
        // }
        return {
            // status: `Added ${unitName} - Prepare to attack!`,
            status: `Thanks for registering!`,
            // asset: assetEntry,
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
