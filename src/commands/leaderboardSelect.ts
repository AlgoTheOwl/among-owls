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

    let data
    if (leaderboardType === LeadersBoards.WINS) {
      data = (await collections.users
        .find({ yaoWins: { $gt: 0 } })
        .limit(10)
        .sort({ yaoWins: 'desc' })
        .toArray()) as WithId<User>[]
    }
    if (leaderboardType === LeadersBoards.KOS) {
    }
    if (leaderboardType === LeadersBoards.KOD) {
    }

    await interaction.deferReply()

    interaction.editReply('done')
  },
}

const findKos = () => {}
