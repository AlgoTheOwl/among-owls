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
        var _a;
        const { user: { id }, } = interaction;
        const data = (await database_service_1.collections.users.findOne({
            discordId: id,
        }));
        console.log(data.assets);
        if (!(data === null || data === void 0 ? void 0 : data.assets)) {
            return interaction.reply({
                content: 'You have no AOWLs to select!',
                ephemeral: true,
            });
        }
        if (!__1.game.waitingRoom) {
            return interaction.reply({
                content: 'Game is not currently active',
                ephemeral: true,
            });
        }
        if ((_a = data === null || data === void 0 ? void 0 : data.assets) === null || _a === void 0 ? void 0 : _a.length) {
            const options = data.assets.map((asset) => {
                return {
                    label: asset.assetName,
                    description: 'Select to play',
                    value: asset === null || asset === void 0 ? void 0 : asset.assetId.toString(),
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
