"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const __1 = require("..");
const discord_js_1 = require("discord.js");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('send-select')
        .setDescription('send a select victim menu'),
    async execute(interaction) {
        if (!interaction.isButton())
            return;
        const playerArr = Object.values(__1.game.players);
        const victims = playerArr
            .filter((player) => !player.timedOut && !player.dead)
            .map((player) => ({
            label: `Attack ${player.username}`,
            description: '',
            value: player.discordId,
        }));
        const victimSelectMenu = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('select-victim')
            .setPlaceholder('Select a victim to attack')
            .addOptions(victims));
        interaction.reply({
            content: 'Select a victim',
            ephemeral: true,
            components: [victimSelectMenu],
        });
    },
};
