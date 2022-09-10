"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Schemas
const embeds_1 = __importDefault(require("../constants/embeds"));
// Embeds
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('asset-profile')
        .setDescription('view an asset profile'),
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        await interaction.deferReply();
        const { values, user, channelId } = interaction;
        const assetId = Number(values[0]);
        const discordId = user.id;
        const initialUserData = (await database_service_1.collections.users.findOne({
            discordId,
        }));
        if (!initialUserData.assets[assetId]) {
            return interaction.editReply({
                content: `You can't see another users asset profile`,
            });
        }
        const { value: userData } = (await database_service_1.collections.users.findOneAndUpdate({
            discordId,
        }, {
            $set: { selectedAssetId: assetId },
        }, { returnDocument: 'after' }
        // Why won't it let me user the User model?
        ));
        if (!userData) {
            return interaction.editReply({
                content: 'Please register before trying to view assets',
            });
        }
        const asset = userData.assets[assetId];
        if (asset) {
            const { assetUrl, assetName, unitName, assetId, wins, alias, kos, losses, } = asset;
            const winNumber = wins ? wins : 0;
            const lossNumber = losses ? losses : 0;
            const koNumber = kos ? kos : 0;
            const fields = [
                { name: 'Unit name', value: unitName },
                { name: 'Asset name', value: assetName.slice(0, 100) },
                { name: 'Asset ID', value: assetId.toString() },
                { name: 'Wins', value: winNumber.toString() },
                { name: 'Losses', value: lossNumber.toString() },
                { name: 'KOs', value: koNumber.toString() },
            ];
            if (alias) {
                fields.splice(1, 0, { name: 'Custom name', value: alias.slice(0, 100) });
            }
            await interaction.editReply((0, embeds_2.default)(embeds_1.default.assetProfile, channelId, {
                assetUrl,
                fields,
                assetName,
            }));
        }
    },
};
