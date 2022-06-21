"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('view-registration')
        .setDescription('View how many players have registered'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const amountOfPlayers = await database_service_1.collections.yaoPlayers.find({}).toArray();
        await interaction.reply({
            content: `There are currently ${amountOfPlayers.length} players registered`,
            ephemeral: true,
        });
    },
};
