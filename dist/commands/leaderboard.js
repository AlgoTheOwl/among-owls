"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show global leaderboard for AOWL games'),
    enabled: true,
    async execute(interaction) {
        if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
            return;
        const options = [
            {
                label: 'Most KOs',
                description: 'See AOWLs ranked by KOs',
                value: 'leaderboard-kos',
            },
            {
                label: 'Most Wins',
                description: 'See AOWLs ranked by wins',
                value: 'leaderboard-wins',
            },
            {
                label: `Most KO'd`,
                description: 'See AOWLs ranked by losses',
                value: 'leaderboard-kod',
            },
        ];
        const selectMenu = new discord_js_1.SelectMenuBuilder()
            .setCustomId('leaderboard-select')
            .setPlaceholder('Select leaderboard')
            .addOptions(options);
        const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
        interaction.reply({
            content: 'Choose leaderboard type',
            //@ts-ignore
            components: [row],
        });
    },
};
