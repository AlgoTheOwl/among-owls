"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Globals
const __1 = require("..");
const database_service_1 = require("../database/database.service");
const helpers_1 = require("../utils/helpers");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename your AOWL')
        .addStringOption((option) => option
        .setName('name')
        .setDescription('enter a new name for your AOWL')
        .setRequired(true)),
    enabled: true,
    /**
     * Command that allows user to rename their chosen AOWL
     * Selected AOWL can be represented by an AOWL currently registered in a game
     * OR the current AOWL a user has selected in their profile
     * @param interaction {Interaction}
     * @returns {void}
     */
    async execute(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const { user, channelId } = interaction;
        const game = __1.games[channelId];
        const name = interaction.options.getString('name');
        const player = (game === null || game === void 0 ? void 0 : game.players[user.id]) || null;
        let assetId;
        const userData = (await database_service_1.collections.users.findOne({
            discordId: user.id,
        }));
        // Grab assetId
        if (player) {
            // update local state
            player.asset.alias = name;
            // grab assetId from registered player
            assetId = player.asset.assetId;
        }
        else {
            // grab assetID from db
            assetId = userData === null || userData === void 0 ? void 0 : userData.selectedAssetId;
        }
        // Player has no assetId
        if (!assetId) {
            interaction.reply({
                content: `Please select an asset in your user profile (/profile) or enter the waiting room to register`,
                ephemeral: true,
            });
        }
        else {
            // Update assets in db
            const { assets } = userData;
            const updatedAsset = Object.assign(Object.assign({}, userData.assets[assetId]), { alias: name });
            const updatedAssets = Object.assign(Object.assign({}, assets), { [assetId]: updatedAsset });
            await database_service_1.collections.users.findOneAndUpdate({ _id: userData._id }, {
                $set: {
                    assets: updatedAssets,
                    selectedAssetId: undefined,
                },
            });
            interaction.reply({
                content: `Your AOWL is now named ${name}`,
                ephemeral: true,
            });
            (0, helpers_1.updateGame)(channelId);
        }
    },
};
