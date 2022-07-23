// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
// Helpers
import { confirmRole, resetGame } from '../utils/helpers'
// Globals
import { game } from '..'

const roleId: string = process.env.ADMIN_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current game'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const { user } = interaction

    const hasRole = await confirmRole(roleId, interaction, user.id)

    if (!hasRole) {
      return await interaction.reply({
        content: 'Only administrators can use this command',
        ephemeral: true,
      })
    }

    if (!game?.active && !game.waitingRoom)
      return interaction.reply({
        content: 'Game is not currently running',
        ephemeral: true,
      })

    resetGame(true)
    return interaction.reply({ content: 'Game stopped', ephemeral: true })
  },
}
