import { LeadersBoards } from '../constants/leaderboard'
import { SelectMenuInteraction } from 'discord.js'
import { collections } from '../database/database.service'
import { WithId } from 'mongodb'
import User from '../models/user'
import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard-select')
    .setDescription('show leaderboards'),
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu()) return
    const { values } = interaction
    const leaderboardType = values[0]

    await interaction.deferReply()

    let queryKey = 'yaoWins'
    if (leaderboardType === LeadersBoards.KOS) {
      queryKey = 'yaoKos'
    }
    if (leaderboardType === LeadersBoards.KOD) {
      queryKey = 'yaoKod'
    }

    const data = (await collections.users
      .find({ [queryKey]: { $gt: 0 } })
      .limit(10)
      .sort({ [queryKey]: 'desc' })
      .toArray()) as WithId<User>[]

    if (!data.length) {
      return interaction.editReply('Not rankings yet')
    }

    const fields = data?.map((user, i) => {
      const place = i + 1
      const rankNumber = user.getStaticProperty(queryKey)
      const win = rankNumber === 1 ? 'win' : 'wins'
      return {
        name: `#${place}: ${user.username}`,
        value: `${rankNumber} ${win}`,
      }
    })

    console.log(fields)

    interaction.editReply('done')
  },
}
