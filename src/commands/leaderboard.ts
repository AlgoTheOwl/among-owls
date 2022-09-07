// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import {
  ActionRowBuilder,
  Interaction,
  InteractionType,
  SelectMenuBuilder,
} from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('show global leaderboard for AOWL games'),
  enabled: true,
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return

    const options = [
      {
        label: 'Most KOs',
        description: 'See AOWLs ranked by KOs',
        value: 'leaderboard-kos',
      },
      {
        label: 'Most Wins',
        description: 'See AOWLs ranked by wins',
        value: 'leaderboard-wins',
      },
      {
        label: `Most KO'd`,
        description: 'See AOWLs ranked by losses',
        value: 'leaderboard-kod',
      },
    ]

    const selectMenu = new SelectMenuBuilder()
      .setCustomId('leaderboard-select')
      .setPlaceholder('Select leaderboard')
      .addOptions(options)

    const row = new ActionRowBuilder().addComponents(selectMenu)
    interaction.reply({
      content: 'Choose leaderboard type',
      //@ts-ignore
      components: [row],
    })
  },
}
