"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const __2 = require("..");
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
        if (!(__1.game === null || __1.game === void 0 ? void 0 : __1.game.active) && !__1.game.waitingRoom)
            return interaction.reply({
                content: 'Game is not currently running',
                ephemeral: true,
            });
        (0, helpers_1.resetGame)(true);
        __2.intervals.timeoutInterval && clearInterval(__2.intervals.timeoutInterval);
        return interaction.reply({ content: 'Game stopped', ephemeral: true });
    },
};
