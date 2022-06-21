import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { collections } from '../database/database.service'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-registration')
    .setDescription('View how many players have registered'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return

    const amountOfPlayers = await collections.yaoPlayers.find({}).toArray()

    await interaction.reply({
      content: `There are currently ${amountOfPlayers.length} players registered`,
      ephemeral: true,
    })
  },
}
