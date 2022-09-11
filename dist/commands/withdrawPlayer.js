"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const index_1 = require("../index");
const gameplay_1 = require("../utils/gameplay");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('withdraw-player')
        .setDescription('Withdraw an active player'),
    /**
     * Withdraws a players current registered asset from the waiting room
     * @param interaction {ButtonInteraction}
     * @returns
     */
    async execute(interaction) {
        try {
            if (!interaction.isButton())
                return;
            const { channelId } = interaction;
            const game = index_1.games[channelId];
            if (!game.waitingRoom)
                return;
            const { user } = interaction;
            const { id } = user;
            const player = game === null || game === void 0 ? void 0 : game.players[id];
            if (player) {
                delete game.players[id];
                interaction.reply({
                    ephemeral: true,
                    content: `${player.asset.alias || player.asset.assetName} removed`,
                });
                (0, gameplay_1.updateGame)(channelId);
            }
            else {
                interaction.reply({
                    ephemeral: true,
                    content: 'You have no AOWLs to withdraw',
                });
            }
        }
        catch (error) {
            console.log('****** WITHDRAW ERROR ******', error);
        }
    },
};
