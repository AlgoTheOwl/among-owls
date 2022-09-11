// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'
// Globals
import { games } from '..'
import { validateUserRole } from '../utils/discord'
import { getSettings } from '../utils/settings'

const adminId = process.env.ADMIN_ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('begin-game')
    .setDescription('begin the game'),
  /**
   * Triggers start of game if there are enough players
   * @param interaction {ButtonInteraction}
   * @returns {void``}
   */
  async execute(interaction: ButtonInteraction) {
    const { user, channelId } = interaction
    const { minCapacity } = await getSettings(channelId)
    const game = games[channelId]
    const playerArr = Object.values(game.players)

    // Allow admins to trigger game start even if not registered in game
    if (!game.players[user.id]) {
      const isAdmin = validateUserRole(adminId, interaction, user.id)
      if (!isAdmin) {
        return interaction.reply({
          content: 'You need to be registered in gameplay to start the game',
          ephemeral: true,
        })
      }
    }

    // Trigger game and let channel know who started it
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
