"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const database_service_1 = require("../database/database.service");
const embeds_1 = __importDefault(require("../embeds"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show global leaderboard for AOWL games'),
    async execute(interaction) {
        if (!interaction.isCommand())
            return;
        const winningUsers = (await database_service_1.collections.users
            .find({ yaoWins: { $gt: 0 } })
            .sort({ yaoWins: 'desc' })
            .toArray());
        if (winningUsers.length) {
            const embedData = {
                title: 'Leaderboard',
                description: 'Which AOWLs rule them all?',
                image: undefined,
                fields: winningUsers.map((user, i) => {
                    const place = i + 1;
                    const win = user.yaoWins === 1 ? 'win' : 'wins';
                    return {
                        name: `#${place}: ${user.username}`,
                        value: `${user.yaoWins} ${win}`,
                    };
                }),
            };
            await interaction.reply((0, embeds_1.default)(embedData));
        }
        else {
            await interaction.reply({ content: 'no winners yet!', ephemeral: true });
        }
    },
};
