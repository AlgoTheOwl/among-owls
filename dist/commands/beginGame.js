"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Globals
const __1 = require("..");
const helpers_1 = require("../utils/helpers");
const settings_1 = require("../utils/settings");
const adminId = process.env.ADMIN_ID;
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('begin-game')
        .setDescription('begin the game'),
    async execute(interaction) {
        const { user, channelId } = interaction;
        const { minCapacity } = await (0, settings_1.getSettings)(channelId);
        const game = __1.games[channelId];
        const playerArr = Object.values(game.players);
        if (!game.players[user.id]) {
            const isAdmin = (0, helpers_1.confirmRole)(adminId, interaction, user.id);
            if (!isAdmin) {
                return interaction.reply({
                    content: 'You need to be registered in gameplay to start the game',
                    ephemeral: true,
                });
            }
        }
        if (playerArr.length >= minCapacity) {
            game.waitingRoom = false;
            interaction.reply({
                content: `${user.username} has started the game`,
            });
            setTimeout(() => {
                interaction.deleteReply();
            }, 10000);
        }
        else {
            interaction.reply({
                content: `You can't start with less than ${minCapacity} players`,
                ephemeral: true,
            });
        }
    },
};
