import { SlashCommandBuilder } from '@discordjs/builders'
import { game } from '..'
import Player from '../models/player'
import {
  ButtonInteraction,
  MessageSelectMenu,
  MessageActionRow,
} from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-select')
    .setDescription('send a select victim menu'),
  async execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return

    const playerArr = Object.values(game.players)

    const victims = playerArr
      .filter((player: Player) => !player.timedOut && !player.dead)
      .map((player: Player) => ({
        label: `Attack ${player.username}`,
        description: '',
        value: player.discordId,
      }))

    const victimSelectMenu = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('select-victim')
        .setPlaceholder('Select a victim to attack')
        .addOptions(victims)
    )

    interaction.reply({
      content: 'Select a victim',
      ephemeral: true,
      components: [victimSelectMenu],
    })
  },
}
