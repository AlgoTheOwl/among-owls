import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import User from '../models/user'
import doEmbed from '../embeds'
import embeds from '../constants/embeds'
import { InteractionReplyOptions } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('show global leaderboard for AOWL games'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const winningUsers = (await collections.users
      .find({ yaoWins: { $gt: 0 } })
      .limit(10)
      .sort({ yaoWins: 'desc' })
      .toArray()) as WithId<User>[]

    const fields = winningUsers.map((user, i) => {
      const place = i + 1
      const win = user.yaoWins === 1 ? 'win' : 'wins'
      return {
        name: `#${place}: ${user.username}`,
        value: `${user.yaoWins} ${win}`,
      }
    })

    if (fields?.length) {
      await interaction.reply(
        doEmbed(embeds.leaderBoard, { fields }) as InteractionReplyOptions
      )
    } else {
      await interaction.reply({ content: 'no winners yet!', ephemeral: true })
    }
  },
}
