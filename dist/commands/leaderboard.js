"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
// Data
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../constants/embeds"));
// Helpers
const embeds_2 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show global leaderboard for AOWL games'),
    enabled: true,
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const winningUsers = (await database_service_1.collections.users
            .find({ yaoWins: { $gt: 0 } })
            .limit(10)
            .sort({ yaoWins: 'desc' })
            .toArray());
        const fields = winningUsers.map((user, i) => {
            const place = i + 1;
            const win = user.yaoWins === 1 ? 'win' : 'wins';
            return {
                name: `#${place}: ${user.username}`,
                value: `${user.yaoWins} ${win}`,
            };
        });
        if (fields === null || fields === void 0 ? void 0 : fields.length) {
            await interaction.reply((0, embeds_2.default)(embeds_1.default.leaderBoard, { fields }));
        }
        else {
            await interaction.reply({ content: 'no winners yet!', ephemeral: true });
        }
    },
};
