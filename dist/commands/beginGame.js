"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('begin-game')
        .setDescription('begin the game'),
    async execute(interaction) {
        const playerArr = Object.values(__1.game.players);
        if (playerArr.length) {
            console.log('Starting game');
            __1.game.waitingRoom = false;
            interaction.deferUpdate();
        }
        else {
            interaction.reply({
                content: `You can't start with less than two players`,
                ephemeral: true,
            });
        }
    },
};
