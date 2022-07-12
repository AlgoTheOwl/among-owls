"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const algorand_1 = require("../utils/algorand");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('claim your hoot!'),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
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
        const status = await (0, algorand_1.claimHoot)(hoot, address);
        console.log(status);
        // if (status) {
        //   return interaction.editReply(
        //     `Congrats, you've just received ${hoot} $HOOT!`
        //   )
        // } else {
        //   return interaction.editReply(
        //     'Something went wrong with your claim :( - please try again'
        //   )
        // }
    },
};
