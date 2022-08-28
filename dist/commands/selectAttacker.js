"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
// Globals
const __1 = require("..");
const settings_1 = require("../utils/settings");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-attacker')
        .setDescription(`Pick which AOWL you'd like to compete`),
    async execute(interaction) {
        try {
            const { user: { id }, channelId, } = interaction;
            const game = __1.games[channelId];
            const { maxAssets } = await (0, settings_1.getSettings)(channelId);
            if (!game.waitingRoom) {
                return interaction.reply({
                    content: 'Game is not currently active. Use the /start command to start the game',
                    ephemeral: true,
                });
            }
            await interaction.deferReply({ ephemeral: true });
            const data = (await database_service_1.collections.users.findOne({
                discordId: id,
            }));
            if (data === null) {
                return interaction.editReply({
                    content: 'You are not registered. Use the /register command',
                });
            }
            const assetData = (data === null || data === void 0 ? void 0 : data.assets) ? Object.values(data.assets) : [];
            if (!assetData.length) {
                return interaction.editReply({
                    content: 'You have no AOWLs to select!',
                });
            }
            const options = Object.values(data.assets)
                .map((asset, i) => {
                var _a;
                if (i < maxAssets) {
                    const label = asset.alias || asset.assetName;
                    const normalizedLabel = label.slice(0, 20);
                    return {
                        label: normalizedLabel,
                        description: 'Select to play',
                        value: (_a = asset === null || asset === void 0 ? void 0 : asset.assetId) === null || _a === void 0 ? void 0 : _a.toString(),
                    };
                }
            })
                .filter(Boolean);
            const selectMenu = new discord_js_1.SelectMenuBuilder()
                .setCustomId('register-player')
                .setPlaceholder('Select an AOWL to attack');
            if (options.length) {
                selectMenu.addOptions(options);
            }
            const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({
                content: 'Choose your AOWL',
                //@ts-ignore
                components: [row],
            });
        }
        catch (error) {
            console.log('****** PLAYER SELECTION ERROR ******', error);
        }
    },
};
