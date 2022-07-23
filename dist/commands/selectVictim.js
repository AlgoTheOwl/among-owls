"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Globals
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-victim')
        .setDescription('Choose a new victim to attack'),
    async execute(interaction) {
        if (!__1.game)
            return;
        const { values: idArr, user } = interaction;
        const victimId = idArr[0] || null;
        if (!victimId) {
            return interaction.editReply({
                content: 'Something went wrong, please try again',
            });
        }
        const player = __1.game.players[user.id];
        if (victimId === 'random') {
            if (player)
                player.victimId = undefined;
            return interaction.reply({
                ephemeral: true,
                content: `You have chosen to attack a random player`,
            });
        }
        const victim = __1.game.players[victimId];
        if (!__1.game.active || __1.game.waitingRoom) {
            return interaction.reply({
                content: 'There is no active game to select a victim',
                ephemeral: true,
            });
        }
        if (player && victim) {
            if (victimId === user.id) {
                return interaction.reply({
                    content: "You can't attack yourself, try again",
                    ephemeral: true,
                });
            }
            if (player === null || player === void 0 ? void 0 : player.victimId) {
                player.victimId = victimId;
            }
            if (victim) {
                return interaction.reply({
                    ephemeral: true,
                    content: `You have chosen ${victim.username}'s AOWL to be your victim, good choice. 😈`,
                });
            }
        }
        else {
            return interaction.reply({
                ephemeral: true,
                content: 'Something went wrong. Please try again.',
            });
        }
    },
};
