"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const embeds_1 = __importDefault(require("../constants/embeds"));
const database_service_1 = require("../database/database.service");
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('asset-profile')
        .setDescription('view an asset profile'),
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        await interaction.deferReply({ ephemeral: true });
        const { values, user } = interaction;
        const assetId = Number(values[0]);
        const discordId = user.id;
        const { assets } = (await database_service_1.collections.users.findOne({
            discordId,
        }));
        const asset = assets[assetId];
        if (asset) {
            const { assetUrl, assetName, unitName, assetId, wins } = asset;
            const winNumber = wins ? wins : 0;
            const fields = [
                { name: 'Unit name', value: unitName },
                { name: 'Asset ID', value: assetId.toString() },
                { name: 'Wins', value: winNumber.toString() },
            ];
            interaction.editReply((0, embeds_2.default)(embeds_1.default.assetProfile, {
                assetUrl,
                fields,
                assetName,
            }));
        }
    },
};
