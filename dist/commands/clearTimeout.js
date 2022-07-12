"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const helpers_1 = require("../utils/helpers");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-timeout')
        .setDescription('clear all timeouts'),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isCommand())
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
