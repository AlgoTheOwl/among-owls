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
const settings_1 = require("../utils/settings");
// Globals
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('profile')
        .setDescription('view your profile'),
    enabled: true,
    async execute(interaction) {
        var _a;
        try {
            if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
                return;
            const { user, channelId } = interaction;
            const { maxAssets } = await (0, settings_1.getSettings)(channelId);
            await interaction.deferReply();
            const userData = (await database_service_1.collections.users.findOne({
                discordId: user.id,
            })) || null;
            if (!userData) {
                return interaction.editReply({
                    content: 'You need to register to use this command',
                });
            }
            const selectMenu = new discord_js_1.SelectMenuBuilder()
                .setCustomId('asset-profile')
                .setPlaceholder('See your AOWL stats');
            const assetArray = Object.values(userData.assets);
            if (!assetArray.length) {
                return interaction.editReply({
                    content: 'You have no AOWLS to profile.',
                });
            }
            const wins = assetArray.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.wins;
            }, 0);
            const losses = assetArray.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.losses;
            }, 0);
            console.log(wins);
            console.log(losses);
            const options = assetArray
                .map((asset, i) => {
                var _a;
                if (i < maxAssets) {
                    return {
                        label: asset.alias || asset.assetName,
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
            const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
            const embed = (0, embeds_2.default)(embeds_1.default.profile, channelId, {
                thumbNail,
                fields,
            });
            await interaction.editReply({
                content: 'Choose your AOWL',
                //@ts-ignore
                components: [row],
                embeds: [embed],
            });
        }
        catch (error) {
            console.log('****** PROFLE ERROR ******', error);
        }
    },
};
const getAssetRounds = (asset) => asset.wins + asset.losses;
