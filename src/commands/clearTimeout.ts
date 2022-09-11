// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
// Data
import { collections } from '../database/database.service'
// Helpers
import { validateUserRole } from '../utils/discord'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-timeout')
    .setDescription('clear all timeouts'),
  enabled: process.env.CLEAR_TIMEOUT_ENABLED,
  /**
   * Allows an admin to clear asset timeouts
   * @param interaction
   * @returns
   */
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return

    await interaction.deferReply({ ephemeral: true })

    const isAdmin = await validateUserRole(
      process.env.ADMIN_ID,
      interaction,
      interaction.user.id
    )

    if (!isAdmin) {
      interaction.editReply('Only admins can use this command')
    }

    await collections.users.updateMany({}, { $set: { coolDowns: {} } })

    return await interaction.editReply('Timeouts cleared')
  },
}
