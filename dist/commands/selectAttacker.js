"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-attacker')
        .setDescription(`Pick which AOWL you'd like to compete`),
    async execute(interaction) {
        const { user: { id }, } = interaction;
        const { assets } = (await database_service_1.collections.users.findOne({
            discordId: id,
        }));
        if (!__1.game.waitingRoom) {
            return interaction.reply({
                content: 'Game is not currently active',
                ephemeral: true,
            });
        }
        if (assets === null || assets === void 0 ? void 0 : assets.length) {
            const options = assets.map((asset) => {
                return {
                    label: asset.assetName,
                    description: 'Select to play',
                    value: asset.assetId.toString(),
                };
            });
            const row = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
                .setCustomId('register-player')
                .setPlaceholder('Select an AOWL to attack')
                .addOptions(options));
            await interaction.reply({
                content: 'Choose your AOWL',
                components: [row],
                ephemeral: true,
            });
        }
    },
};
