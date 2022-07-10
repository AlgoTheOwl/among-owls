import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { collections } from '../database/database.service'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-timeout')
    .setDescription('clear all timeouts'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    await interaction.deferReply({ ephemeral: true })

    await collections.users.updateMany({}, { $set: { coolDowns: {} } })

    return await interaction.editReply('Timeouts cleared')
  },
}
