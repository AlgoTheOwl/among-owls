"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRegistration = void 0;
const algorand_1 = require("../utils/algorand");
const user_1 = __importDefault(require("../models/user"));
const database_service_1 = require("../database/database.service");
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const helpers_1 = require("../utils/helpers");
const optInAssetId = Number(process.env.OPT_IN_ASSET_ID);
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('register')
        .setDescription('register for When AOWLS Attack')
        .addStringOption((option) => option
        .setName('address')
        .setDescription('enter the your wallet address')
        .setRequired(true)),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user, options } = interaction;
        if (__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) {
            return interaction.reply({
                content: 'Please wait until after the game ends to register',
                ephemeral: true,
            });
        }
        // TODO: add ability to register for different games here
        const address = options.getString('address');
        const { username, id } = user;
        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({
            content: 'Thanks for registering! This might take a while! Please check back in a few minutes',
            ephemeral: true,
        });
        if (address) {
            const { status, registeredUser, asset } = await (0, exports.processRegistration)(username, id, address);
            // add permissions if succesful
            if (registeredUser && asset) {
                (0, helpers_1.addRole)(interaction, process.env.REGISTERED_ID, registeredUser);
            }
            await interaction.followUp({
                ephemeral: true,
                content: status,
            });
        }
    },
};
const processRegistration = async (username, discordId, address) => {
    var _a, _b, _c;
    try {
        // Attempt to find user in db
        let user = (await ((_a = database_service_1.collections.users) === null || _a === void 0 ? void 0 : _a.findOne({
            discordId,
        })));
        // Check to see if wallet has opt-in asset
        // Retreive assetIds from specific collections
        const { walletOwned, nftsOwned } = await (0, algorand_1.determineOwnership)(address);
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
            database_service_1.collections.users.findOneAndUpdate({ _id: user._id }, { $set: { assets: nftsOwned, address } });
        }
        if (!walletOwned) {
            return {
                status: `Looks like you haven't opted in to to asset ${optInAssetId}. Please opt in on Rand Gallery by using this link: https://www.randgallery.com/algo-collection/?address=${optInAssetId}`,
            };
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
