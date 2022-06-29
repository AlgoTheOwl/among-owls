import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { game } from '..'
import Player from '../models/player'
import { asyncForEach } from '../utils/helpers'
import { collections } from '../database/database.service'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-timeout')
    .setDescription('clear all timeouts'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return
    const playerArr = Object.values(game.players)

    await interaction.deferReply({ ephemeral: true })

    asyncForEach(playerArr, async (player: Player) => {
      await collections.users.findOneAndUpdate(
        { _id: player.userId },
        { $set: { coolDownDone: null } }
      )
    })
    return await interaction.editReply('Timeouts cleared')
  },
}
