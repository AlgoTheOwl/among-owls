// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { SelectMenuInteraction } from 'discord.js'
// Globals
import { games } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-victim')
    .setDescription('Choose a new victim to attack'),
  /**
   * Allows active player to select another player to target throughout the game
   * @param interaction {SelectMenuInteraction}
   * @returns {void}
   */
  async execute(interaction: SelectMenuInteraction) {
    const { channelId } = interaction
    const game = games[channelId]

    if (!game.active || game.waitingRoom) {
      return interaction.reply({
        content: 'There is no active game to select a victim',
        ephemeral: true,
      })
    }

    const { values: idArr, user } = interaction

    const victimId = idArr[0]

    const player = game.players[user.id]
    const victim = game.players[victimId]

    if (!player || player.dead) {
      return interaction.reply({
        ephemeral: true,
        content: `You can't attack, you're dead!`,
      })
    }

    if (victimId === 'random') {
      if (player) player.victimId = undefined
      return interaction.reply({
        ephemeral: true,
        content: `You have chosen to attack a random player`,
      })
    }

    if (player && victim) {
      if (victimId === user.id) {
        return interaction.reply({
          content: "You can't attack yourself, try again",
          ephemeral: true,
        })
      }

      player.victimId = victimId

      return interaction.reply({
        ephemeral: true,
        content: `You have chosen ${victim.username}'s AOWL to be your victim, good choice. 😈`,
      })
    } else {
      return interaction.reply({
        ephemeral: true,
        content: 'Something went wrong. Please try again.',
      })
    }
  },
}
