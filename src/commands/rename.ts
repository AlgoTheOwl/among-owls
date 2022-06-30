import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
import { game } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename your AOWL')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('enter a new name for your AOWL')
        .setRequired(true)
    ),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return
    const { user } = interaction
    const name = interaction.options.getString('name') as string
    game.players[user.id].asset.assetName = name
    interaction.reply({
      content: `Your AOWL is now named ${name}`,
      ephemeral: true,
    })
  },
}
