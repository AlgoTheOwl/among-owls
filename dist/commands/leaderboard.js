"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Discord
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// Data
// Schemas
// Helpers
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show global leaderboard for AOWL games'),
    enabled: true,
    async execute(interaction) {
        if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
            return;
        const options = [
            {
                label: '',
                description: '',
                value: '',
            },
            {
                label: '',
                description: '',
                value: '',
            },
            {
                label: '',
                description: '',
                value: '',
            },
        ];
        const selectMenu = new discord_js_1.SelectMenuBuilder()
            .setCustomId('leaderboard-select')
            .setPlaceholder('Select leaderboard')
            .addOptions();
        // const { channelId } = interaction
        // const winningUsers = (await collections.users
        //   .find({ yaoWins: { $gt: 0 } })
        //   .limit(10)
        //   .sort({ yaoWins: 'desc' })
        //   .toArray()) as WithId<User>[]
        // const fields = winningUsers.map((user, i) => {
        //   const place = i + 1
        //   const win = user.yaoWins === 1 ? 'win' : 'wins'
        //   return {
        //     name: `#${place}: ${user.username}`,
        //     value: `${user.yaoWins} ${win}`,
        //   }
        // })
        // if (fields?.length) {
        //   await interaction.reply(
        //     doEmbed(embeds.leaderBoard, channelId, {
        //       fields,
        //     }) as InteractionReplyOptions
        //   )
        // } else {
        //   await interaction.reply({ content: 'no winners yet!', ephemeral: true })
        // }
    },
};
