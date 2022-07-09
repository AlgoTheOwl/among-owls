"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const database_service_1 = require("../database/database.service");
const settings_1 = __importDefault(require("../settings"));
const embeds_1 = __importDefault(require("../constants/embeds"));
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('profile')
        .setDescription('view your profile'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { maxAssets } = settings_1.default;
        const { user } = interaction;
        await interaction.deferReply();
        const { assets } = (await database_service_1.collections.users.findOne({
            discordId: user.id,
        }));
        const selectMenu = new discord_js_1.MessageSelectMenu()
            .setCustomId('register-player')
            .setPlaceholder('Select an AOWL to attack');
        const options = assets
            .map((asset, i) => {
            var _a;
            if (i < maxAssets) {
                return {
                    label: asset.assetName,
                    description: 'Select and AOWL to view',
                    value: (_a = asset === null || asset === void 0 ? void 0 : asset.assetId) === null || _a === void 0 ? void 0 : _a.toString(),
                };
            }
        })
            .filter(Boolean);
        if (options.length) {
            selectMenu.addOptions(options);
        }
        // const fields =
        // picture of first asset
        // discord username
        // field for hoot owned
        // field for games won
        // time sent
        // possible collage of all nfts owned
        const row = new discord_js_1.MessageActionRow().addComponents(selectMenu);
        const embed = (0, embeds_2.default)(embeds_1.default.profile, {});
        await interaction.editReply({
            content: 'Choose your AOWL',
            components: [row],
            embeds: [embed],
        });
    },
};
