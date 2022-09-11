import doEmbed from '../embeds'
import embeds from '../constants/embeds'
import { SelectMenuInteraction, InteractionReplyOptions } from 'discord.js'
import { collections } from '../database/database.service'
import { SlashCommandBuilder } from '@discordjs/builders'

enum LeaderBoards {
  KOS = 'leaderboard-kos',
  KOD = 'leaderboard-kod',
  WINS = 'leaderboard-wins',
}

interface LeaderBoardTypeData {
  queryKey: string
  singularVerb: string
  plurlaVerb: string
  description: string
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard-select')
    .setDescription('show leaderboards'),
  /**
   * Sends specified leaderboard to client
   * @param interaction {SelectMenuInteraction}
   * @returns {void}
   */
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu()) return
    try {
      const { values, channelId } = interaction
      const leaderboardType = values[0]

      await interaction.deferReply()

      let leaderboardData: LeaderBoardTypeData = {
        queryKey: 'yaoWins',
        singularVerb: 'win',
        plurlaVerb: 'wins',
        description: 'Which AOWLs rule them all?',
      }

      if (leaderboardType === LeaderBoards.KOS) {
        leaderboardData = {
          queryKey: 'yaoKos',
          singularVerb: 'KO',
          plurlaVerb: 'KOs',
          description: 'Which AOWLs bring the ruckus?',
        }
      }
      if (leaderboardType === LeaderBoards.KOD) {
        leaderboardData = {
          queryKey: 'yaoLosses',
          singularVerb: 'loss',
          plurlaVerb: 'losses',
          description: 'Which AOWLs get wrecked?',
        }
      }

      const data = await collections.users
        .find({ [leaderboardData.queryKey]: { $gt: 0 } })
        .limit(10)
        .sort({ [leaderboardData.queryKey]: 'desc' })
        .toArray()

      if (!data.length) {
        return interaction.editReply('Not rankings yet')
      }

      const fields = data?.map((user, i) => {
        const place = i + 1
        const numberOf = user[leaderboardData.queryKey]
        const win =
          numberOf === 1
            ? leaderboardData.singularVerb
            : leaderboardData.plurlaVerb
        return {
          name: `#${place}: ${user.username}`,
          value: `${numberOf} ${win}`,
        }
      })

      await interaction.editReply(
        doEmbed(embeds.leaderBoard, channelId, {
          fields,
          description: leaderboardData.description,
        }) as InteractionReplyOptions
      )
    } catch (error) {
      console.log('****** LEADERBOARD SELECT ERROR *******', error)
    }
  },
}
