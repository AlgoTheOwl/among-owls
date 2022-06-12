import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { confirmRole } from '../utils/helpers'
import { game } from '..'
import { intervals } from '..'

const roleId: string = process.env.ADMIN_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current game'),

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

    if (!game?.active)
      return interaction.reply({
        content: 'Game is not currently running',
        ephemeral: true,
      })

    game.active = false
    intervals.timeoutInterval && clearInterval(intervals.timeoutInterval)
    return interaction.reply({ content: 'Game stopped', ephemeral: true })
  },
}
