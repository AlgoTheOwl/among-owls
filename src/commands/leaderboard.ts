// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
import { InteractionReplyOptions } from 'discord.js'
// Data
import { collections } from '../database/database.service'
// Schemas
import { WithId } from 'mongodb'
import User from '../models/user'
import embeds from '../constants/embeds'
// Helpers
import doEmbed from '../embeds'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('show global leaderboard for AOWL games'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return

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
