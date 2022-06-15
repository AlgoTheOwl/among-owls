import { SlashCommandBuilder } from '@discordjs/builders'
import { SelectMenuInteraction } from 'discord.js'
import { game } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-victim')
    .setDescription('Choose a new victim to attack'),
  async execute(interaction: SelectMenuInteraction) {
    if (!game) return
    const { values: idArr, user } = interaction

    const victimId = idArr[0] || null

    if (!victimId) {
      return interaction.reply({
        content: 'Something went wrong selecting a player, please try again',
        ephemeral: true,
      })
    }

    interaction.deferUpdate()

    if (game.players[user.id]) {
      game.players[user.id].victimId = victimId
    }
  },
}
