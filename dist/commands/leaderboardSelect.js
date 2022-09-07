"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderBoards = void 0;
const embeds_1 = __importDefault(require("../embeds"));
const embeds_2 = __importDefault(require("../constants/embeds"));
const database_service_1 = require("../database/database.service");
const builders_1 = require("@discordjs/builders");
var LeaderBoards;
(function (LeaderBoards) {
    LeaderBoards["KOS"] = "leaderboard-kos";
    LeaderBoards["KOD"] = "leaderboard-kod";
    LeaderBoards["WINS"] = "leaderboard-wins";
})(LeaderBoards = exports.LeaderBoards || (exports.LeaderBoards = {}));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard-select')
        .setDescription('show leaderboards'),
    async execute(interaction) {
        if (!interaction.isSelectMenu())
            return;
        try {
            const { values, channelId } = interaction;
            const leaderboardType = values[0];
            await interaction.deferReply();
            let leaderboardData = {
                queryKey: 'yaoWins',
                singularVerb: 'win',
                plurlaVerb: 'wins',
                description: 'Which AOWLs rule them all?',
            };
            if (leaderboardType === LeaderBoards.KOS) {
                leaderboardData = {
                    queryKey: 'yaoKos',
                    singularVerb: 'KO',
                    plurlaVerb: 'KOs',
                    description: 'Which AOWLs bring the ruckus?',
                };
            }
            if (leaderboardType === LeaderBoards.KOD) {
                leaderboardData = {
                    queryKey: 'yaoLosses',
                    singularVerb: 'loss',
                    plurlaVerb: 'losses',
                    description: 'Which AOWLs get wrecked?',
                };
            }
            const data = await database_service_1.collections.users
                .find({ [leaderboardData.queryKey]: { $gt: 0 } })
                .limit(10)
                .sort({ [leaderboardData.queryKey]: 'desc' })
                .toArray();
            if (!data.length) {
                return interaction.editReply('Not rankings yet');
            }
            const fields = data === null || data === void 0 ? void 0 : data.map((user, i) => {
                const place = i + 1;
                const numberOf = user[leaderboardData.queryKey];
                const win = numberOf === 1
                    ? leaderboardData.singularVerb
                    : leaderboardData.plurlaVerb;
                return {
                    name: `#${place}: ${user.username}`,
                    value: `${numberOf} ${win}`,
                };
            });
            await interaction.editReply((0, embeds_1.default)(embeds_2.default.leaderBoard, channelId, {
                fields,
                description: leaderboardData.description,
            }));
        }
        catch (error) {
            console.log('****** LEADERBOARD SELECT ERROR *******', error);
        }
    },
};
