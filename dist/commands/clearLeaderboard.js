"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const helpers_1 = require("../utils/helpers");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-leaderboard')
        .setDescription('clear the leaderboard standings'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user: { id }, } = interaction;
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, id);
        if (!hasRole) {
            return interaction.reply({
                content: 'You do not have the required role to use this command',
                ephemeral: true,
            });
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            await database_service_1.collections.users.updateMany({}, { $set: { yaoWins: 0 } });
        }
        catch (error) {
            console.log(error);
        }
        return interaction.editReply({
            content: 'Leaderboard cleared',
        });
    },
};