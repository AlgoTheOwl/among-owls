// Discord
import { ButtonInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

import { game } from '../index'
import { updateGame } from '../utils/helpers'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw-player')
    .setDescription('Withdraw an active player'),
  async execute(interaction: ButtonInteraction) {
    try {
      if (!interaction.isButton()) return
      if (!game.waitingRoom) return

      const { user } = interaction
      const { id } = user

      const player = game?.players[id]

      if (player) {
        delete game.players[id]

        interaction.reply({
          ephemeral: true,
          content: `${player.asset.alias || player.asset.assetName} removed`,
        })
        updateGame()
      } else {
        interaction.reply({
          ephemeral: true,
          content: 'You have no AOWLs to withdraw',
        })
      }
    } catch (error) {
      console.log(error)
    }
  },
}
