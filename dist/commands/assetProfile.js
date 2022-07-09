"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('asset_profile')
        .setDescription('view an asset profile'),
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        const { values, user } = interaction;
        const assetId = Number(values[0]);
        const discordId = user.id;
        const { assets } = (await database_service_1.collections.users.findOne({
            discordId,
        }));
        const asset = assets.find((asset) => asset.assetId === assetId);
        console.log(asset);
    },
};
