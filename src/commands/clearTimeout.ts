// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
// Data
import { collections } from '../database/database.service'
// Helpers
import { confirmRole } from '../utils/helpers'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-timeout')
    .setDescription('clear all timeouts'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    await interaction.deferReply({ ephemeral: true })

    const isAdmin = await confirmRole(
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
