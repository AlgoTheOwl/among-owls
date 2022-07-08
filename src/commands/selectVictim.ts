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

    const victimId = idArr[0]

    const player = game.players[user.id]
    const victim = game.players[victimId]

    if (victimId === 'random') {
      player.victimId = undefined
      return interaction.reply({
        ephemeral: true,
        content: `You have chosen to attack a random player`,
      })
    }

    if (victimId === user.id) {
      return interaction.reply({
        content: "You can't attack yourself, try again",
        ephemeral: true,
      })
    }

    player.victimId = victimId as string
    interaction.reply({
      ephemeral: true,
      content: `You have chosen ${victim.username}'s AOWL to be your victim, good choice. 😈`,
    })
  },
}
