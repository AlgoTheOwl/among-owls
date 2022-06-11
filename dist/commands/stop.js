"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const helpers_1 = require("../utils/helpers");
const start_1 = require("./start");
const __1 = require("..");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the current game'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user } = interaction;
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        if (!(start_1.game === null || start_1.game === void 0 ? void 0 : start_1.game.active))
            return interaction.reply({
                content: 'Game is not currently running',
                ephemeral: true,
            });
        start_1.game.active = false;
        clearInterval(__1.kickPlayerInterval);
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    },
};
