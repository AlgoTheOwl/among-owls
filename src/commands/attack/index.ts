import { ButtonInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { attack } from './attack'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Attack another user!'),
  async execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return
    attack(interaction, false)
  },
}
