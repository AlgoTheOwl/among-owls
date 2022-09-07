"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const leaderboard_1 = require("../constants/leaderboard");
const database_service_1 = require("../database/database.service");
const builders_1 = require("@discordjs/builders");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard-select')
        .setDescription('show leaderboards'),
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        const { values } = interaction;
        const leaderboardType = values[0];
        let data;
        if (leaderboardType === leaderboard_1.LeadersBoards.WINS) {
            data = (await database_service_1.collections.users
                .find({ yaoWins: { $gt: 0 } })
                .limit(10)
                .sort({ yaoWins: 'desc' })
                .toArray());
        }
        if (leaderboardType === leaderboard_1.LeadersBoards.KOS) {
        }
        if (leaderboardType === leaderboard_1.LeadersBoards.KOD) {
        }
        await interaction.deferReply();
        interaction.editReply('done');
    },
};
