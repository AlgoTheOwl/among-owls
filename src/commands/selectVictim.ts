import { SlashCommandBuilder } from '@discordjs/builders'
import { SelectMenuInteraction } from 'discord.js'
import { game } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-victim')
    .setDescription('Choose a new victim to attack'),
  async execute(interaction: SelectMenuInteraction) {
    const { values: idArr, user } = interaction

    const victimId = idArr[0]

    game.players[user.id].victimId = victimId

    interaction.deferUpdate()
  },
}
