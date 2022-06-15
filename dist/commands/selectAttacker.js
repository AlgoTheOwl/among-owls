"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('select-attacker')
        .setDescription(`Pick which AOWL you'd like to compete`),
    async execute(interaction) {
        // This step gets all of your NFTs from your user object
        // It should also download asset from the blockchain
        const row = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('create-player')
            .setPlaceholder('Select an AOWL to attack')
            .addOptions([
            {
                label: 'Select me',
                description: 'This is a description',
                value: 'first_option',
            },
            {
                label: 'You can select me too',
                description: 'This is also a description',
                value: 'second_option',
            },
        ]));
        await interaction.reply({
            content: 'Choose your AOWL',
            components: [row],
            ephemeral: true,
        });
    },
};
