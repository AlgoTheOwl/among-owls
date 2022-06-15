import { SelectMenuInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { game } from '../index'

// add player object to db here
module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-player')
    .setDescription('Register an active player'),
  async execute(interaction: SelectMenuInteraction) {
    if (!interaction.isSelectMenu() || !game?.active) return
  },
}
