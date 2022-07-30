// Discord
import { Interaction, SelectMenuInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
import { collections } from '../database/database.service'
// Schemas
import Asset from '../models/asset'
import { WithId } from 'mongodb'
import User from '../models/user'
import Player from '../models/player'
// Helpers
import { downloadFile, wait } from '../utils/helpers'
// Globals
import { game } from '../index'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw-player')
    .setDescription('Withdraw an active player'),
  async execute(interaction: Interaction) {
    try {
      if (!interaction.isSelectMenu()) return
      if (!game.waitingRoom) return

      const { user } = interaction
      const { id } = user

      if (game?.players[id]) {
        delete game.players[id]

        interaction.reply({
          ephemeral: true,
          content: 'AOWL removed',
        })
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
