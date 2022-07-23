"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// Data
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../constants/embeds"));
// Helpers
const embeds_2 = __importDefault(require("../embeds"));
// Globals
const settings_1 = __importDefault(require("../settings"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('profile')
        .setDescription('view your profile'),
    enabled: true,
    async execute(interaction) {
        var _a;
        try {
            if (!interaction.isCommand())
                return;
            const { maxAssets } = settings_1.default;
            const { user } = interaction;
            await interaction.deferReply();
            const userData = (await database_service_1.collections.users.findOne({
                discordId: user.id,
            })) || null;
            if (!userData) {
                return interaction.reply({
                    ephemeral: true,
                    content: 'You need to register to use this command',
                });
            }
            const selectMenu = new discord_js_1.MessageSelectMenu()
                .setCustomId('asset-profile')
                .setPlaceholder('See your AOWL stats');
            const assetArray = Object.values(userData.assets);
            if (!assetArray.length) {
                return interaction.reply({
                    ephemeral: true,
                    content: 'You have no AOWLS to profile.',
                });
            }
            const options = assetArray
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
            const fields = [];
            let thumbNail;
            // picture of first asset
            const firstAsset = (_a = userData.assets[0]) === null || _a === void 0 ? void 0 : _a.assetUrl;
            if (firstAsset) {
                thumbNail = firstAsset;
            }
            const hoot = userData.hoot ? userData.hoot.toString() : '0';
            const yaoWins = userData.yaoWins ? userData.yaoWins.toString() : '0';
            // discord username
            fields.push({ name: 'Username', value: user.username }, { name: 'Hoot owned', value: hoot }, { name: 'Games won', value: yaoWins });
            const row = new discord_js_1.MessageActionRow().addComponents(selectMenu);
            const embed = (0, embeds_2.default)(embeds_1.default.profile, {
                thumbNail,
                fields,
            });
            await interaction.editReply({
                content: 'Choose your AOWL',
                components: [row],
                embeds: [embed],
            });
        }
        catch (error) {
            console.log('Error getting profile');
            console.log(error);
        }
    },
};
