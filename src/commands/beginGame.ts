import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'
import { game } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('begin-game')
    .setDescription('begin the game'),
  async execute(interaction: ButtonInteraction) {
    const playerArr = Object.values(game.players)

    if (playerArr.length) {
      game.waitingRoom = false
      interaction.reply({
        content: `Game starting...`,
        ephemeral: true,
      })
    } else {
      interaction.reply({
        content: `You can't start with less than two players`,
        ephemeral: true,
      })
    }
  },
}
