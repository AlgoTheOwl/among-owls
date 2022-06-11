import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { collections } from '../database/database.service'
import { EmbedData } from '../types/game'
import { WithId } from 'mongodb'
import User from '../models/user'
import doEmbed from '../embeds'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('show global leaderboard for AOWL games'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const winningUsers = (await collections.users
      .find({ yaoWins: { $gt: 0 } })
      .sort({ yaoWins: 'desc' })
      .toArray()) as WithId<User>[]

    if (winningUsers.length) {
      const embedData: EmbedData = {
        title: 'Leaderboard',
        description: 'Which AOWLs rule them all?',
        image: undefined,
        fields: winningUsers.map((user, i) => {
          const place = i + 1
          const win = user.yaoWins === 1 ? 'win' : 'wins'
          return {
            name: `#${place}: ${user.username}`,
            value: `${user.yaoWins} ${win}`,
          }
        }),
      }

      await interaction.reply(doEmbed(embedData))
    } else {
      await interaction.reply({ content: 'no winners yet!', ephemeral: true })
    }
  },
}
