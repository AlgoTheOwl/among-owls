"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const helpers_1 = require("../utils/helpers");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-leaderboard')
        .setDescription('clear the leaderboard standings'),
    enabled: true,
    /**
     * Allows admins to clear leaderboard standings
     * @param interaction {Interaction}
     * @returns {void}
     */
    async execute(interaction) {
        if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
            return;
        const { user: { id }, } = interaction;
        const hasRole = (0, helpers_1.confirmRole)(roleId, interaction, id);
        if (!hasRole) {
            return interaction.reply({
                content: 'You do not have the required role to use this command',
                ephemeral: true,
            });
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            await database_service_1.collections.users.updateMany({}, { $set: { yaoWins: 0, yaoLosses: 0, yaoKos: 0 } });
        }
        catch (error) {
            console.log(error);
        }
        return interaction.editReply({
            content: 'Leaderboard cleared',
        });
    },
};
