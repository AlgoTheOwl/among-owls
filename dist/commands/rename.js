"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Globals
const __1 = require("..");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename your AOWL')
        .addStringOption((option) => option
        .setName('name')
        .setDescription('enter a new name for your AOWL')
        .setRequired(true)),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user } = interaction;
        const name = interaction.options.getString('name');
        __1.game.players[user.id].asset.assetName = name;
        interaction.reply({
            content: `Your AOWL is now named ${name}`,
            ephemeral: true,
        });
        // Ensure game knows to update
        __1.game.update = true;
        setTimeout(() => {
            __1.game.update = false;
        }, 3000);
    },
};
