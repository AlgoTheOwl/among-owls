"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const helpers_1 = require("../utils/helpers");
const database_service_1 = require("../database/database.service");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('clear-timeout')
        .setDescription('clear all timeouts'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const playerArr = Object.values(__1.game.players);
        await interaction.deferReply({ ephemeral: true });
        (0, helpers_1.asyncForEach)(playerArr, async (player) => {
            await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, { $set: { coolDownDone: null } });
        });
        return await interaction.editReply('Timeouts cleared');
    },
};
