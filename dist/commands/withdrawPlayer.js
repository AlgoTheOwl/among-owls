"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const index_1 = require("../index");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('withdraw-player')
        .setDescription('Withdraw an active player'),
    async execute(interaction) {
        try {
            if (!interaction.isButton())
                return;
            if (!index_1.game.waitingRoom)
                return;
            const { user } = interaction;
            const { id } = user;
            const player = index_1.game === null || index_1.game === void 0 ? void 0 : index_1.game.players[id];
            if (player) {
                delete index_1.game.players[id];
                interaction.reply({
                    ephemeral: true,
                    content: `${player.asset.assetName} removed`,
                });
            }
            else {
                interaction.reply({
                    ephemeral: true,
                    content: 'You have no AOWLs to withdraw',
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    },
};
