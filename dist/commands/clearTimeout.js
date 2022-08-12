"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const helpers_1 = require("../utils/helpers");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-timeout')
        .setDescription('clear all timeouts'),
    enabled: process.env.CLEAR_TIMEOUT_ENABLED,
    async execute(interaction) {
        if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
            return;
        await interaction.deferReply({ ephemeral: true });
        const isAdmin = await (0, helpers_1.confirmRole)(process.env.ADMIN_ID, interaction, interaction.user.id);
        if (!isAdmin) {
            interaction.editReply('Only admins can use this command');
        }
        await database_service_1.collections.users.updateMany({}, { $set: { coolDowns: {} } });
        return await interaction.editReply('Timeouts cleared');
    },
};
