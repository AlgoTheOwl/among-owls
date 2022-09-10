"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discrod
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// Data
const database_service_1 = require("../database/database.service");
// Helpers
const algorand_1 = require("../utils/algorand");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('claim your hoot!'),
    enabled: true,
    /**
     * Allows user to initiate transfer of Hoot token to own wallet
     * @param interaction {Interaction}
     * @returns {void}
     */
    async execute(interaction) {
        if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
            return;
        try {
            const { user } = interaction;
            await interaction.deferReply({ ephemeral: true });
            const userData = (await database_service_1.collections.users.findOne({
                discordId: user.id,
            }));
            if (!userData) {
                return interaction.editReply({
                    content: 'You are not in the database',
                });
            }
            const { hoot, address } = userData;
            if (!hoot) {
                return interaction.editReply({
                    content: 'You have no hoot to claim',
                });
            }
            await database_service_1.collections.users.findOneAndUpdate({ discordId: user.id }, { $set: { hoot: 0 } });
            const status = await (0, algorand_1.claimHoot)(hoot, address);
            if (status) {
                return interaction.editReply(`Congrats, you've just received ${hoot} HOOT!`);
            }
        }
        catch (error) {
            return interaction.editReply('Something went wrong with your claim :( - please try again');
        }
    },
};
