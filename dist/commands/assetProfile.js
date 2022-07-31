"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
//Data
const database_service_1 = require("../database/database.service");
// Schemas
const embeds_1 = __importDefault(require("../constants/embeds"));
// Embeds
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('asset-profile')
        .setDescription('view an asset profile'),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        await interaction.deferReply();
        const { values, user } = interaction;
        const assetId = Number(values[0]);
        const discordId = user.id;
        const { value: userData } = (await database_service_1.collections.users.findOneAndUpdate({
            discordId,
        }, {
            $set: { selectedAssetId: assetId },
        }, { returnDocument: 'after' }
        // Why won't it let me user the User model?
        ));
        if (!userData) {
            return interaction.reply({
                ephemeral: true,
                content: 'Please register before trying to view assets',
            });
        }
        const asset = userData.assets[assetId];
        if (asset) {
            const { assetUrl, assetName, unitName, assetId, wins, alias } = asset;
            const winNumber = wins ? wins : 0;
            const fields = [
                { name: 'Unit name', value: unitName },
                { name: 'Asset name', value: alias || assetName },
                { name: 'Asset ID', value: assetId.toString() },
                { name: 'Wins', value: winNumber.toString() },
            ];
            await interaction.editReply((0, embeds_2.default)(embeds_1.default.assetProfile, {
                assetUrl,
                fields,
                assetName,
            }));
        }
    },
};
