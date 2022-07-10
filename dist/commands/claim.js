"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('claim your hoot!'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const { user } = interaction;
        await interaction.deferReply({ ephemeral: true });
        const userData = (await database_service_1.collections.users.findOne({
            discordId: user.id,
        }));
        if (!userData) {
            return interaction.reply({
                content: 'You are not in the database',
                ephemeral: true,
            });
        }
        const { hoot } = userData;
    },
};
