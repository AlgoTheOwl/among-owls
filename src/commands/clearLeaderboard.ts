// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
// Data
import { collections } from '../database/database.service'
// Helpers
import { confirmRole } from '../utils/helpers'

const roleId = process.env.ADMIN_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-leaderboard')
    .setDescription('clear the leaderboard standings'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const {
      user: { id },
    } = interaction

    const hasRole = await confirmRole(roleId, interaction, id)

    if (!hasRole) {
      return interaction.reply({
        content: 'You do not have the required role to use this command',
        ephemeral: true,
      })
    }

    await interaction.deferReply({ ephemeral: true })

    try {
      await collections.users.updateMany({}, { $set: { yaoWins: 0 } })
    } catch (error) {
      console.log(error)
    }
    return interaction.editReply({
      content: 'Leaderboard cleared',
    })
  },
}
