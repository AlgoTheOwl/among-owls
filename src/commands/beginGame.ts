import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'
import { game } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('begin-game')
    .setDescription('begin the game'),
  async execute(interaction: ButtonInteraction) {
    const { user } = interaction
    const playerArr = Object.values(game.players)

    if (playerArr.length) {
      game.waitingRoom = false
      interaction.reply({
        content: `${user.username} has started the game`,
      })
      setTimeout(() => {
        interaction.deleteReply()
      }, 2000)
    } else {
      interaction.reply({
        content: `You can't start with less than two players`,
        ephemeral: true,
      })
    }
  },
}
