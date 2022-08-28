"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// Helpers
const helpers_1 = require("../utils/helpers");
// Globals
const __1 = require("..");
const roleId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the current game'),
    async execute(interaction) {
        if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
            return;
        const { user, channelId } = interaction;
        const game = __1.games[channelId];
        const hasRole = await (0, helpers_1.confirmRole)(roleId, interaction, user.id);
        if (!hasRole) {
            return await interaction.reply({
                content: 'Only administrators can use this command',
                ephemeral: true,
            });
        }
        if (!(game === null || game === void 0 ? void 0 : game.active) && !game.waitingRoom)
            return interaction.reply({
                content: 'Game is not currently running',
                ephemeral: true,
            });
        (0, helpers_1.resetGame)(true, channelId);
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    },
};
