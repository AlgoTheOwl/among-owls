// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'
// Globals
import { games } from '..'
import settings from '../settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('begin-game')
    .setDescription('begin the game'),
  async execute(interaction: ButtonInteraction) {
    const { user, channelId } = interaction
    const { minCapacity } = settings[channelId]
    const game = games[channelId]
    const playerArr = Object.values(game.players)

    if (!playerArr.includes()

    if (!game.waitingRoom) {
      return interaction.reply({
        content:
          'Game is not currently active. use the /start command to start the game',
        ephemeral: true,
      })
    }

    if (playerArr.length >= minCapacity) {
      game.waitingRoom = false
      interaction.reply({
        content: `${user.username} has started the game`,
      })
      setTimeout(() => {
        interaction.deleteReply()
      }, 10000)
    } else {
      interaction.reply({
        content: `You can't start with less than ${minCapacity} players`,
        ephemeral: true,
      })
    }
  },
}
