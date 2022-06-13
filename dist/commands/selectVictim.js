"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-victim')
        .setDescription('Choose a new victim to attack'),
    async execute(interaction) {
        const { values: idArr, user } = interaction;
        const victimId = idArr[0] || null;
        if (!victimId) {
            return interaction.reply({
                content: 'Something went wrong selecting a player, please try again',
                ephemeral: true,
            });
        }
        interaction.deferUpdate();
        __1.game.players[user.id].victimId = victimId;
    },
};
