// Discrod
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
// Schemas
import { WithId } from 'mongodb'
import User from '../models/user'
// Data
import { collections } from '../database/database.service'
// Helpers
import { claimHoot } from '../utils/token'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('claim your hoot!'),

  enabled: true,
  /**
   * Allows user to initiate transfer of Hoot token to own wallet
   * @param interaction {Interaction}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return
    try {
      const { user } = interaction

      await interaction.deferReply({ ephemeral: true })

      const userData = (await collections.users.findOne({
        discordId: user.id,
      })) as WithId<User>

      if (!userData) {
        return interaction.editReply({
          content: 'You are not in the database',
        })
      }

      const { hoot, address } = userData

      if (!hoot) {
        return interaction.editReply({
          content: 'You have no hoot to claim',
        })
      }

      await collections.users.findOneAndUpdate(
        { discordId: user.id },
        { $set: { hoot: 0 } }
      )

      const status = await claimHoot(hoot, address)
      if (status) {
        return interaction.editReply(
          `Congrats, you've just received ${hoot} HOOT!`
        )
      }
    } catch (error) {
      return interaction.editReply(
        'Something went wrong with your claim :( - please try again'
      )
    }
  },
}
