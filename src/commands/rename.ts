// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction } from 'discord.js'
// Globals
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
  enabled: true,
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return
    if (Object.values(game?.players?.length)) {
      const { user } = interaction
      const name = interaction.options.getString('name') as string
      game.players[user.id].asset.assetName = name

      interaction.reply({
        content: `Your AOWL is now named ${name}`,
        ephemeral: true,
      })
      // Ensure game knows to update
      game.update = true
      setTimeout(() => {
        game.update = false
      }, 3000)
    } else {
      interaction.reply({
        content: `Please enter the waiting room to rename your AOWL`,
        ephemeral: true,
      })
    }
  },
}
