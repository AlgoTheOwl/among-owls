"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-timeout')
        .setDescription('clear all timeouts'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        await interaction.deferReply({ ephemeral: true });
        await database_service_1.collections.users.updateMany({}, { $set: { coolDownDone: null } });
        return await interaction.editReply('Timeouts cleared');
    },
};
